"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

const initialForm = {
  code: "",
  name: "",
  description: "",
  price: "",
  speed: "",
  featured: false,
  active: true,
  displayOrder: 0,
};

const money = (value) => new Intl.NumberFormat("vi-VN").format(Number(value) || 0);

async function readResponse(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { detail: text.slice(0, 200) }; }
}

function errorText(data, fallback) {
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;
  return fallback;
}

export default function PackagesManager() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...initialForm });
  const [featuresText, setFeaturesText] = useState("");
  const formRef = useRef(null);

  const loadPackages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/packages", { cache: "no-store" });
      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }
      const data = await readResponse(response);
      if (!response.ok) throw new Error(errorText(data, `Không tải được danh sách (HTTP ${response.status})`));
      if (!Array.isArray(data)) throw new Error("API Admin phải trả về mảng gói cước. Kiểm tra GET /api/admin/packages.");
      setPackages(data);
      setError("");
    } catch (err) {
      setError(err.message || "Không thể kết nối API quản lý gói cước.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPackages(); }, [loadPackages]);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLocaleLowerCase("vi");
    return packages
      .filter((item) => {
        if (filter === "active" && !item.active) return false;
        if (filter === "hidden" && item.active) return false;
        return !q || `${item.name || ""} ${item.code || ""} ${item.description || ""}`.toLocaleLowerCase("vi").includes(q);
      })
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || Number(a.id) - Number(b.id));
  }, [packages, keyword, filter]);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  function resetForm() {
    setEditingId(null);
    setForm({ ...initialForm });
    setFeaturesText("");
  }

  function editPackage(item) {
    setEditingId(item.id);
    setForm({
      code: item.code ?? "",
      name: item.name ?? "",
      description: item.description ?? "",
      price: String(item.price ?? ""),
      speed: item.speed ?? "",
      featured: Boolean(item.featured),
      active: Boolean(item.active),
      displayOrder: item.displayOrder ?? 0,
    });
    setFeaturesText(Array.isArray(item.features) ? item.features.join("\n") : "");
    setError("");
    setSuccess("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function savePackage(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const price = Number(form.price);
    const displayOrder = Number(form.displayOrder);
    if (!form.code.trim() || !form.name.trim() || form.price === "" || !Number.isSafeInteger(price) || price < 0) {
      setError("Vui lòng nhập mã, tên và giá hợp lệ (số nguyên không âm).");
      return;
    }
    if (!Number.isSafeInteger(displayOrder)) {
      setError("Thứ tự hiển thị phải là số nguyên.");
      return;
    }

    const payload = {
      ...form,
      code: form.code.trim(),
      name: form.name.trim(),
      price,
      displayOrder,
      features: featuresText.split("\n").map((s) => s.trim()).filter(Boolean),
    };

    setBusy(true);
    try {
      const response = await fetch(
        editingId === null ? "/api/admin/packages" : `/api/admin/packages/${editingId}`,
        {
          method: editingId === null ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }
      const data = await readResponse(response);
      if (!response.ok) throw new Error(errorText(data, `Lưu thất bại (HTTP ${response.status}). Kiểm tra API PUT/POST.`));
      resetForm();
      await loadPackages();
      setSuccess(editingId === null ? "Đã thêm gói cước thành công." : "Đã cập nhật gói cước thành công.");
    } catch (err) {
      setError(err.message || "Không thể lưu gói cước.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(item) {
    const action = item.active ? "ẩn" : "hiển thị lại";
    if (!window.confirm(`Bạn muốn ${action} gói ${item.name}?`)) return;
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      // Dùng PUT để bật/tắt trạng thái, không xóa dữ liệu trong database.
      const payload = {
        code: item.code,
        name: item.name,
        description: item.description ?? "",
        price: item.price,
        speed: item.speed ?? "",
        features: Array.isArray(item.features) ? item.features : [],
        featured: Boolean(item.featured),
        active: !item.active,
        displayOrder: item.displayOrder ?? 0,
      };
      const response = await fetch(`/api/admin/packages/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }
      const data = await readResponse(response);
      if (!response.ok) throw new Error(errorText(data, `Không thể ${action} gói cước (HTTP ${response.status})`));
      await loadPackages();
      setSuccess(`Đã ${action} gói ${item.name}.`);
    } catch (err) {
      setError(err.message || "Không thể thay đổi trạng thái.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-orange-600">FPT TELECOM ADMIN</p>
            <h1 className="mt-2 text-3xl font-black">Quản lý gói cước</h1>
            <p className="mt-2 text-sm text-slate-500">Chỉnh sửa dữ liệu hiển thị trên website mà không thay đổi giao diện khách hàng.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/dashboard" className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold">← Dashboard</Link>
            <Link href="/" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-semibold text-blue-700">Xem website</Link>
          </div>
        </div>

        {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        {success && <div role="status" className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">{success}</div>}

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Tổng gói cước", packages.length],
            ["Đang hiển thị", packages.filter((p) => p.active).length],
            ["Đã ẩn", packages.filter((p) => !p.active).length],
          ].map(([label, count]) => (
            <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-black text-blue-800">{count}</p>
            </div>
          ))}
        </section>

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Danh sách tất cả gói cước</h2>
            <button type="button" onClick={() => { resetForm(); setError(""); setSuccess(""); formRef.current?.scrollIntoView({ behavior: "smooth" }); }} className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600">+ Thêm gói mới</button>
          </div>
          <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo tên, mã gói, mô tả..." className="min-w-0 rounded-xl border border-slate-300 px-4 py-3" aria-label="Tìm gói cước" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3" aria-label="Lọc trạng thái">
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hiển thị</option>
              <option value="hidden">Đã ẩn</option>
            </select>
            <button type="button" onClick={loadPackages} disabled={loading || busy} className="rounded-xl border border-slate-300 px-4 py-3 font-semibold disabled:opacity-50">Tải lại</button>
          </div>
          {loading ? (
            <p className="py-10 text-center text-slate-500">Đang tải danh sách gói cước...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-3">Gói cước</th>
                    <th className="p-3">Giá/tháng</th>
                    <th className="p-3">Tốc độ</th>
                    <th className="p-3">Thứ tự</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 align-middle">
                      <td className="p-3">
                        <p className="font-bold text-blue-800">{item.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.code}</p>
                        {item.featured && <span className="mt-1 inline-block text-xs font-bold text-orange-600">★ Gói nổi bật</span>}
                      </td>
                      <td className="p-3 font-semibold">{money(item.price)}đ</td>
                      <td className="p-3">{item.speed || "—"}</td>
                      <td className="p-3">{item.displayOrder ?? 0}</td>
                      <td className="p-3">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${item.active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                          {item.active ? "Đang hiển thị" : "Đã ẩn"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" disabled={busy} onClick={() => editPackage(item)} className="rounded-lg border border-blue-200 px-3 py-2 font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50">Sửa</button>
                          <button type="button" disabled={busy} onClick={() => toggleActive(item)} className={`rounded-lg border px-3 py-2 font-bold disabled:opacity-50 ${item.active ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-700 hover:bg-green-50"}`}>
                            {item.active ? "Ẩn" : "Hiển thị lại"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="py-8 text-center text-slate-500">Không tìm thấy gói cước phù hợp.</p>}
            </div>
          )}
        </section>

        <section ref={formRef} className="scroll-mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{editingId === null ? "Thêm gói cước" : `Chỉnh sửa: ${form.name}`}</h2>
              {editingId !== null && <p className="mt-1 text-sm text-slate-500">Đang sửa ID #{editingId}. Nhấn Lưu thay đổi để cập nhật database.</p>}
            </div>
            {editingId !== null && <button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 px-4 py-2 font-semibold">Hủy chỉnh sửa</button>}
          </div>
          <form onSubmit={savePackage}>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Mã gói cước">
                <input required maxLength={50} disabled={editingId !== null} value={form.code} onChange={(e) => setField("code", e.target.value)} placeholder="Ví dụ: giga-f1" className="w-full rounded-xl border border-slate-300 p-3 disabled:bg-slate-100" />
              </Field>
              <Field label="Tên gói cước">
                <input required maxLength={100} value={form.name} onChange={(e) => setField("name", e.target.value)} className="w-full rounded-xl border border-slate-300 p-3" />
              </Field>
              <Field label="Giá mỗi tháng (VNĐ)">
                <input required type="number" min="0" step="1" value={form.price} onChange={(e) => setField("price", e.target.value)} className="w-full rounded-xl border border-slate-300 p-3" />
              </Field>
              <Field label="Tốc độ Internet">
                <input maxLength={100} value={form.speed} onChange={(e) => setField("speed", e.target.value)} placeholder="300–500 Mbps" className="w-full rounded-xl border border-slate-300 p-3" />
              </Field>
              <Field label="Mô tả">
                <input value={form.description} onChange={(e) => setField("description", e.target.value)} className="w-full rounded-xl border border-slate-300 p-3" />
              </Field>
              <Field label="Thứ tự hiển thị">
                <input type="number" step="1" value={form.displayOrder} onChange={(e) => setField("displayOrder", e.target.value)} className="w-full rounded-xl border border-slate-300 p-3" />
              </Field>
            </div>
            <div className="mt-5">
              <Field label="Danh sách ưu đãi (mỗi dòng một ưu đãi)">
                <textarea rows={5} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} placeholder={"Internet tốc độ cao\nTruyền hình giải trí\nCamera AI"} className="w-full rounded-xl border border-slate-300 p-3" />
              </Field>
            </div>
            <div className="mt-5 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 font-medium"><input type="checkbox" checked={form.featured} onChange={(e) => setField("featured", e.target.checked)} /> Gói nổi bật</label>
              <label className="flex items-center gap-2 font-medium"><input type="checkbox" checked={form.active} onChange={(e) => setField("active", e.target.checked)} /> Hiển thị trên website</label>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="submit" disabled={busy} className="rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-50">{busy ? "Đang xử lý..." : editingId === null ? "Thêm gói cước" : "Lưu thay đổi"}</button>
              <button type="button" disabled={busy} onClick={resetForm} className="rounded-xl border border-slate-300 px-6 py-3 font-semibold disabled:opacity-50">Làm mới biểu mẫu</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-2 block font-semibold text-slate-700">{label}</span>{children}</label>;
}
