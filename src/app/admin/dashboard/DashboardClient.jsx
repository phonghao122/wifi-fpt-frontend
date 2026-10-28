"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STATUS = {
  NEW: { label: "Chưa tư vấn", color: "bg-blue-100 text-blue-700" },
  CONTACTED: { label: "Đang tư vấn", color: "bg-amber-100 text-amber-700" },
  CONVERTED: { label: "Đã chốt", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function DashboardClient({ leads, totalElements, totalPages, stats, keyword, status, page }) {
  const router = useRouter();
  const [search, setSearch] = useState(keyword);
  const [filterStatus, setFilterStatus] = useState(status);
  const [selected, setSelected] = useState(null);
  const [editStatus, setEditStatus] = useState("NEW");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function navigate(nextPage = 0, nextKeyword = search, nextStatus = filterStatus) {
    const params = new URLSearchParams();
    if (nextKeyword.trim()) params.set("keyword", nextKeyword.trim());
    if (nextStatus) params.set("status", nextStatus);
    params.set("page", String(nextPage));
    startTransition(() => router.push(`/admin/dashboard?${params}`));
  }

  function openEdit(lead) {
    setSelected(lead);
    setEditStatus(lead.status || "NEW");
    setNote(lead.adminNote || "");
    setError("");
  }

  async function saveEdit(event) {
    event.preventDefault();
    if (!selected || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/leads/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, adminNote: note }),
      });
      if (response.status === 401 || response.status === 403) {
        router.push("/admin/login");
        return;
      }
      if (!response.ok) throw new Error("Không thể cập nhật khách hàng. Vui lòng thử lại.");
      setSelected(null);
      router.refresh();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  }

  const cards = [
    ["Tổng khách hàng", stats.total ?? 0],
    ["Chưa tư vấn", stats.newLeads ?? 0],
    ["Đang tư vấn", stats.contacted ?? 0],
    ["Đã chốt", stats.converted ?? 0],
    ["Đã hủy", stats.cancelled ?? 0],
    ["Tỷ lệ chuyển đổi", `${stats.conversionRate ?? 0}%`],
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 md:px-8">
          <div><h1 className="text-2xl font-extrabold text-orange-500">FPT Telecom</h1><p className="text-sm text-slate-500">CRM quản lý khách hàng WiFi</p></div>
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-lg border px-4 py-2 text-sm">Trang chủ</Link>
            <form action="/api/auth/logout" method="POST"><button className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white">Đăng xuất</button></form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 md:px-8">
        <div><h2 className="text-3xl font-bold">Admin Dashboard</h2><p className="mt-1 text-slate-500">Theo dõi, tư vấn và chuyển đổi khách hàng đăng ký Internet FPT.</p></div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {cards.map(([label, value]) => (
            <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>
          ))}
        </div>
        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-5">
            <h3 className="text-xl font-bold">Danh sách khách hàng</h3>
            <form onSubmit={(e) => { e.preventDefault(); navigate(); }} className="mt-4 flex flex-wrap gap-3">
              <input aria-label="Tìm khách hàng" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên hoặc số điện thoại" className="min-w-52 flex-1 rounded-lg border px-4 py-2 outline-orange-400" />
              <select aria-label="Lọc trạng thái" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border px-3 py-2">
                <option value="">Tất cả trạng thái</option>
                {Object.entries(STATUS).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
              </select>
              <button disabled={pending} className="rounded-lg bg-orange-500 px-5 py-2 font-semibold text-white disabled:opacity-50">Tìm kiếm</button>
              <button type="button" onClick={() => { setSearch(""); setFilterStatus(""); navigate(0, "", ""); }} className="rounded-lg border px-4 py-2">Xóa lọc</button>
            </form>
            <p className="mt-3 text-sm text-slate-500">Tìm thấy {totalElements} khách hàng</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-100 text-slate-600"><tr>{["STT", "Họ tên", "Số điện thoại", "Khu vực", "Gói cước", "Trạng thái", "Ngày đăng ký", "Thao tác"].map((h) => <th key={h} className="px-4 py-4 font-semibold">{h}</th>)}</tr></thead>
              <tbody>
                {leads.map((lead, index) => (
                  <tr key={lead.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-4">{page * 20 + index + 1}</td>
                    <td className="px-4 py-4 font-semibold">{lead.fullName || "—"}</td>
                    <td className="px-4 py-4">{lead.phone || "—"}</td>
                    <td className="px-4 py-4">{lead.province || "—"}</td>
                    <td className="px-4 py-4">{lead.packageId || "—"}</td>
                    <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS[lead.status]?.color || "bg-slate-100"}`}>{STATUS[lead.status]?.label || lead.status}</span></td>
                    <td className="px-4 py-4">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-4"><button onClick={() => openEdit(lead)} className="font-semibold text-blue-600 hover:underline">Chỉnh sửa</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leads.length === 0 && <p className="p-12 text-center text-slate-500">Không tìm thấy khách hàng phù hợp.</p>}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t p-5 text-sm">
            <span>Trang {totalPages === 0 ? 0 : page + 1}/{totalPages}</span>
            <div className="flex gap-2">
              <button disabled={pending || page <= 0} onClick={() => navigate(page - 1, keyword, status)} className="rounded-lg border px-4 py-2 disabled:opacity-40">Trang trước</button>
              <button disabled={pending || page + 1 >= totalPages} onClick={() => navigate(page + 1, keyword, status)} className="rounded-lg border px-4 py-2 disabled:opacity-40">Trang sau</button>
            </div>
          </div>
        </section>
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !saving && setSelected(null)}>
          <form onSubmit={saveEdit} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl">
            <div><h3 className="text-xl font-bold">Chăm sóc khách hàng</h3><p className="mt-1 text-sm text-slate-500">{selected.fullName} · {selected.phone}</p></div>
            <label className="block text-sm font-medium">Trạng thái
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2">{Object.entries(STATUS).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}</select>
            </label>
            <label className="block text-sm font-medium">Ghi chú tư vấn
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={5} maxLength={5000} placeholder="Ví dụ: Khách hẹn lắp vào thứ Bảy..." className="mt-2 w-full rounded-lg border p-3" />
            </label>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => setSelected(null)} className="rounded-lg border px-4 py-2">Hủy</button><button disabled={saving} className="rounded-lg bg-orange-500 px-5 py-2 font-semibold text-white disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu thay đổi"}</button></div>
          </form>
        </div>
      )}
    </main>
  );
}
