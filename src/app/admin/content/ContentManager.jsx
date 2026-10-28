"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DEFAULT_BENEFITS = [
    {
        icon: "⚡",
        title: "Internet tốc độ cao",
        description: "Tư vấn gói cước phù hợp nhu cầu sử dụng.",
    },
    {
        icon: "📷",
        title: "Ưu đãi Camera AI",
        description: "Kiểm tra chương trình và điều kiện áp dụng.",
    },
    {
        icon: "📺",
        title: "Truyền hình giải trí",
        description: "Tìm hiểu các gói combo Internet và truyền hình.",
    },
];
const sections = [
    {
        key: "hero",
        label: "Hero Banner",
        fields: [
            { key: "title", label: "Tiêu đề chính" },
            { key: "description", label: "Mô tả", multiline: true },
            { key: "price", label: "Giá giới thiệu" },
            { key: "image", label: "Ảnh banner", image: true },
        ],
    },
    {
        key: "promotions",
        label: "Ưu đãi",
        fields: [
            { key: "title", label: "Tiêu đề ưu đãi" },
            { key: "description", label: "Nội dung ưu đãi", multiline: true },
        ],
    },
    {
        key: "benefits",
        label: "Lợi ích",
        fields: [
            { key: "title", label: "Tiêu đề khu vực" },
            { key: "description", label: "Mô tả", multiline: true },
        ],
    },

    {
        key: "contact",
        label: "Liên hệ",
        fields: [
            { key: "title", label: "Tiêu đề liên hệ" },
            {
                key: "description",
                label: "Mô tả",
                multiline: true,
            },
            { key: "hotline", label: "Số hotline" },
            { key: "zaloUrl", label: "Link Zalo" },
            {
                key: "facebookUrl",
                label: "Link Facebook Messenger",
            },
            {
                key: "registrationUrl",
                label: "Link đăng ký FPT",
            },
            {
                key: "showHotline",
                label: "Hiển thị nút gọi",
                checkbox: true,
            },
            {
                key: "showZalo",
                label: "Hiển thị Zalo",
                checkbox: true,
            },
            {
                key: "showFacebook",
                label: "Hiển thị Messenger",
                checkbox: true,
            },
            {
                key: "showRegistration",
                label: "Hiển thị link đăng ký",
                checkbox: true,
            },
        ],
    },
];

function apiError(data, fallback) {
    return typeof data?.detail === "string"
        ? data.detail
        : typeof data?.message === "string"
            ? data.message
            : typeof data?.error === "string"
                ? data.error
                : fallback;
}

function isValidImageUrl(url) {
    if (!url || typeof url !== "string") return false;
    if (url.startsWith("/") && !url.startsWith("//")) return true;
    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" && parsed.hostname === "res.cloudinary.com";
    } catch {
        return false;
    }
}

export default function ContentManager() {
    const [activeKey, setActiveKey] = useState("hero");
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [dirty, setDirty] = useState(false);
    const [retryKey, setRetryKey] = useState(0);
    const activeSection = sections.find((section) => section.key === activeKey);
    const requestId = useRef(0);

    const loadContent = useCallback(async (signal) => {
        const id = ++requestId.current;
        setLoading(true);
        setError("");
        setMessage("");
        try {
            const response = await fetch(`/api/admin/content/${activeKey}`, {
                cache: "no-store",
                signal,
            });
            if (response.status === 401 || response.status === 403) {
                window.location.assign("/admin/login");
                return;
            }
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(apiError(data, "Không thể tải nội dung"));
            if (id !== requestId.current || signal.aborted) return;
            setForm(data && typeof data === "object" && !Array.isArray(data) ? data : {});
            setDirty(false);
        } catch (err) {
            if (err.name !== "AbortError" && id === requestId.current) {
                setError(err.message || "Không thể tải nội dung");
            }
        } finally {
            if (id === requestId.current && !signal.aborted) setLoading(false);
        }
    }, [activeKey]);

    useEffect(() => {
        const controller = new AbortController();
        loadContent(controller.signal);
        return () => controller.abort();
    }, [loadContent, retryKey]);

    function updateField(key, value) {
        setForm((previous) => ({ ...previous, [key]: value }));
        setDirty(true);
        setMessage("");
    }


    function getBenefitItems() {
        return Array.isArray(form.items)
            ? form.items
            : DEFAULT_BENEFITS;
    }

    function updateBenefit(index, key, value) {
        const updatedItems = getBenefitItems().map((item, i) =>
            i === index ? { ...item, [key]: value } : item
        );

        updateField("items", updatedItems);
    }

    function addBenefit() {
        const updatedItems = [
            ...getBenefitItems(),
            {
                icon: "✨",
                title: "",
                description: "",
            },
        ];

        updateField("items", updatedItems);
    }

    function removeBenefit(index) {
        const updatedItems = getBenefitItems().filter(
            (_, i) => i !== index
        );

        updateField("items", updatedItems);
    }


    function moveBenefit(index, direction) {
        const items = [...getBenefitItems()];
        const target = index + direction;
        if (target < 0 || target >= items.length) return;
        [items[index], items[target]] = [items[target], items[index]];
        updateField("items", items);
    }

    function getPromotionItems() {
        return Array.isArray(form.items) ? form.items : [];
    }

    function updatePromotion(index, key, value) {
        updateField("items", getPromotionItems().map((item, i) =>
            i === index ? { ...item, [key]: value } : item
        ));
    }

    function addPromotion() {
        updateField("items", [...getPromotionItems(), {
            id: globalThis.crypto?.randomUUID?.() || String(Date.now()),
            title: "", description: "", badge: "", price: "",
            image: "", enabled: true,
        }]);
    }

    function removePromotion(index) {
        updateField("items", getPromotionItems().filter((_, i) => i !== index));
    }

    function movePromotion(index, direction) {
        const items = [...getPromotionItems()];
        const target = index + direction;
        if (target < 0 || target >= items.length) return;
        [items[index], items[target]] = [items[target], items[index]];
        updateField("items", items);
    }

    async function uploadPromotionImage(file, index) {
        if (!file || uploading || saving) return;
        if (!IMAGE_TYPES.has(file.type) || file.size === 0 || file.size > MAX_FILE_SIZE) {
            setError("Chỉ chọn JPG, PNG hoặc WebP, tối đa 5 MB.");
            return;
        }
        const itemsAtStart = getPromotionItems();
        const promotionId = itemsAtStart[index]?.id;
        setUploading(true);
        setError("");
        setMessage("");
        try {
            const body = new FormData();
            body.append("file", file);
            const response = await fetch("/api/admin/upload", { method: "POST", body });
            if (response.status === 401 || response.status === 403) {
                window.location.assign("/admin/login");
                return;
            }
            if (response.status === 413) throw new Error("Ảnh vượt giới hạn upload.");
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(apiError(data, "Upload ảnh thất bại"));
            if (!isValidImageUrl(data.url)) throw new Error("URL Cloudinary không hợp lệ.");
            if (activeKey !== "promotions") return;
            setForm((previous) => ({
                ...previous,
                items: (Array.isArray(previous.items) ? previous.items : []).map((item, i) =>
                    (promotionId ? item.id === promotionId : i === index)
                        ? { ...item, image: data.url }
                        : item
                ),
            }));
            setDirty(true);
            setMessage("Đã upload ảnh. Nhấn Lưu thay đổi để xuất bản.");
        } catch (err) {
            setError(err.message || "Upload ảnh thất bại");
        } finally {
            setUploading(false);
        }
    }

    function changeSection(nextKey) {
        if (nextKey === activeKey || uploading || saving) return;
        if (dirty && !window.confirm("Bạn có thay đổi chưa lưu. Chuyển tab và bỏ các thay đổi này?")) return;
        requestId.current += 1;
        setActiveKey(nextKey);
        setDirty(false);
        setForm({});
    }

    async function uploadImage(file) {
        if (!file || uploading || saving) return;
        if (!IMAGE_TYPES.has(file.type) || file.size === 0 || file.size > MAX_FILE_SIZE) {
            setError("Chỉ chọn ảnh JPG, PNG hoặc WebP, dung lượng tối đa 5 MB.");
            return;
        }
        const sectionAtStart = activeKey;
        setUploading(true);
        setError("");
        setMessage("");
        try {
            const dataToSend = new FormData();
            dataToSend.append("file", file);
            const response = await fetch("/api/admin/upload", {
                method: "POST",
                body: dataToSend,
            });
            if (response.status === 413) {
                throw new Error(
                    "Ảnh vượt quá giới hạn dung lượng upload của máy chủ."
                );
            }
            if (response.status === 401 || response.status === 403) {
                window.location.assign("/admin/login");
                return;
            }
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(apiError(data, "Không thể tải ảnh lên"));
            if (!isValidImageUrl(data.url)) throw new Error("Cloudinary không trả về URL ảnh hợp lệ.");
            if (sectionAtStart !== activeKey) return;
            updateField("image", data.url);
            setMessage("Đã upload ảnh lên Cloudinary. Nhấn ‘Lưu thay đổi’ để áp dụng ảnh vào CMS.");
        } catch (err) {
            setError(err.message || "Upload ảnh thất bại");
        } finally {
            setUploading(false);
        }
    }

    async function saveContent(event) {
        event.preventDefault();
        if (loading || saving || uploading) return;
        setSaving(true);
        setError("");
        setMessage("");
        try {
            const response = await fetch(`/api/admin/content/${activeKey}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    activeKey === "benefits" && !Array.isArray(form.items)
                        ? { ...form, items: DEFAULT_BENEFITS }
                        : form
                ),
            });
            if (response.status === 401 || response.status === 403) {
                window.location.assign("/admin/login");
                return;
            }
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(apiError(data, "Không thể lưu nội dung"));
            setForm(data && typeof data === "object" && !Array.isArray(data) ? data : form);
            setDirty(false);
            setMessage("Đã lưu nội dung thành công.");
        } catch (err) {
            setError(err.message || "Lưu nội dung thất bại");
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-10">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="font-bold text-orange-600">FPT TELECOM ADMIN</p>
                        <h1 className="mt-2 text-3xl font-black text-slate-900">Quản lý nội dung website</h1>
                        <p className="mt-2 text-sm text-slate-500">Chỉnh sửa nội dung và upload ảnh banner lên Cloudinary.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/admin/dashboard" className="rounded-xl border bg-white px-5 py-3 font-semibold text-slate-700">← Dashboard</Link>
                        <Link href="/admin/packages" className="rounded-xl border bg-white px-5 py-3 font-semibold text-slate-700">Gói cước</Link>
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Khu vực nội dung">
                    {sections.map((section) => (
                        <button
                            key={section.key}
                            type="button"
                            role="tab"
                            aria-selected={activeKey === section.key}
                            disabled={uploading || saving}
                            onClick={() => changeSection(section.key)}
                            className={`rounded-xl px-5 py-3 font-semibold transition disabled:opacity-50 ${activeKey === section.key ? "bg-blue-700 text-white" : "bg-white text-slate-700 hover:bg-slate-100"}`}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>

                {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
                {message && <p role="status" className="mb-5 rounded-xl bg-green-50 p-4 text-green-700">{message}</p>}

                <form onSubmit={saveContent} className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-xl font-bold text-slate-900">{activeSection.label}</h2>
                        {dirty && <span className="text-sm font-semibold text-orange-600">Có thay đổi chưa lưu</span>}
                    </div>
                    {loading ? (
                        <p className="py-6 text-slate-500">Đang tải dữ liệu...</p>
                    ) : error && Object.keys(form).length === 0 ? (
                        <button type="button" onClick={() => setRetryKey((n) => n + 1)} className="rounded-xl border px-5 py-3 font-semibold">Thử tải lại</button>
                    ) : (
                        <>
                            <div className="space-y-5">
                                {activeSection.fields.map((field) => (
                                    <div key={field.key}>
                                        <label htmlFor={`cms-${field.key}`} className="mb-2 block font-semibold text-slate-700">{field.label}</label>
                                        {field.checkbox ? (
                                            <label className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={form[field.key] !== false}
                                                    onChange={(event) =>
                                                        updateField(field.key, event.target.checked)
                                                    }
                                                    disabled={saving || uploading}
                                                    className="h-5 w-5 accent-blue-700"
                                                />
                                                <span className="text-sm text-slate-600">
                                                    Bật để hiển thị trên website
                                                </span>
                                            </label>
                                        ) : field.image ? (
                                            <div className="space-y-4">
                                                {isValidImageUrl(form.image) && (
                                                    <div className="overflow-hidden rounded-xl border bg-slate-50 p-3">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={form.image} alt="Xem trước banner" className="max-h-80 w-full rounded-lg object-contain" />
                                                    </div>
                                                )}
                                                <input
                                                    id={`cms-${field.key}`}
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    disabled={uploading || saving}
                                                    onChange={(event) => {
                                                        const selected = event.target.files?.[0];
                                                        if (selected) void uploadImage(selected);
                                                        event.target.value = "";
                                                    }}
                                                    className="block w-full rounded-xl border border-slate-300 p-3 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700"
                                                />
                                                <p className="text-sm text-slate-500">Hỗ trợ JPG, PNG, WebP; tối đa 5 MB.</p>
                                                {uploading && <p role="status" className="font-semibold text-blue-700">Đang upload ảnh lên Cloudinary...</p>}
                                                <label htmlFor="cms-image-url" className="block text-sm font-semibold text-slate-600">Đường dẫn ảnh đã lưu / vừa upload</label>
                                                <input id="cms-image-url" type="text" readOnly value={typeof form.image === "string" ? form.image : ""} placeholder="URL sẽ xuất hiện sau khi upload" className="w-full rounded-xl border bg-slate-100 p-3 text-sm text-slate-600" />
                                            </div>
                                        ) : field.multiline ? (
                                            <textarea
                                                id={`cms-${field.key}`}
                                                rows={4}
                                                value={typeof form[field.key] === "string" ? form[field.key] : String(form[field.key] ?? "")}
                                                onChange={(event) => updateField(field.key, event.target.value)}
                                                disabled={saving || uploading}
                                                className="w-full rounded-xl border border-slate-300 p-3 disabled:bg-slate-50"
                                            />
                                        ) : (
                                            <input
                                                id={`cms-${field.key}`}
                                                type="text"
                                                value={typeof form[field.key] === "string" ? form[field.key] : String(form[field.key] ?? "")}
                                                onChange={(event) => updateField(field.key, event.target.value)}
                                                disabled={saving || uploading}
                                                className="w-full rounded-xl border border-slate-300 p-3 disabled:bg-slate-50"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            {activeKey === "benefits" && (
                                <div className="mt-8 space-y-5">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <h3 className="text-xl font-bold text-slate-900">Danh sách lợi ích</h3>
                                        <button
                                            type="button"
                                            onClick={addBenefit}
                                            disabled={saving || uploading}
                                            className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-50"
                                        >
                                            + Thêm lợi ích
                                        </button>
                                    </div>

                                    {getBenefitItems().map((item, index) => (
                                        <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                                <h4 className="font-bold text-slate-800">Lợi ích #{index + 1}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    <button type="button" onClick={() => moveBenefit(index, -1)} disabled={saving || uploading || index === 0} className="rounded-lg border bg-white px-3 py-2 text-sm disabled:opacity-40">↑ Lên</button>
                                                    <button type="button" onClick={() => moveBenefit(index, 1)} disabled={saving || uploading || index === getBenefitItems().length - 1} className="rounded-lg border bg-white px-3 py-2 text-sm disabled:opacity-40">↓ Xuống</button>
                                                    <button type="button" onClick={() => removeBenefit(index)} disabled={saving || uploading} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 disabled:opacity-40">Xóa</button>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor={`benefit-icon-${index}`} className="mb-2 block font-semibold text-slate-700">Biểu tượng</label>
                                                    <input id={`benefit-icon-${index}`} type="text" value={item?.icon ?? ""} onChange={(event) => updateBenefit(index, "icon", event.target.value)} disabled={saving || uploading} placeholder="⚡ 📷 📺" className="w-full rounded-xl border border-slate-300 bg-white p-3" />
                                                </div>
                                                <div>
                                                    <label htmlFor={`benefit-title-${index}`} className="mb-2 block font-semibold text-slate-700">Tiêu đề</label>
                                                    <input id={`benefit-title-${index}`} type="text" value={item?.title ?? ""} onChange={(event) => updateBenefit(index, "title", event.target.value)} disabled={saving || uploading} className="w-full rounded-xl border border-slate-300 bg-white p-3" />
                                                </div>
                                                <div>
                                                    <label htmlFor={`benefit-description-${index}`} className="mb-2 block font-semibold text-slate-700">Mô tả</label>
                                                    <textarea id={`benefit-description-${index}`} rows={3} value={item?.description ?? ""} onChange={(event) => updateBenefit(index, "description", event.target.value)} disabled={saving || uploading} className="w-full rounded-xl border border-slate-300 bg-white p-3" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {getBenefitItems().length === 0 && (
                                        <p className="rounded-xl bg-slate-50 p-5 text-center text-slate-500">Chưa có lợi ích nào. Nhấn “Thêm lợi ích” để tạo mới.</p>
                                    )}
                                </div>
                            )}

                            {activeKey === "promotions" && (
                                <div className="mt-8 space-y-5">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <h3 className="text-xl font-bold text-slate-900">Danh sách khuyến mãi</h3>
                                        <button type="button" onClick={addPromotion} disabled={saving || uploading} className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white disabled:opacity-50">+ Thêm khuyến mãi</button>
                                    </div>
                                    {getPromotionItems().map((item, index) => (
                                        <div key={item.id || index} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <h4 className="font-bold">Khuyến mãi #{index + 1}</h4>
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => movePromotion(index, -1)} disabled={saving || uploading || index === 0} className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40">↑</button>
                                                    <button type="button" onClick={() => movePromotion(index, 1)} disabled={saving || uploading || index === getPromotionItems().length - 1} className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40">↓</button>
                                                    <button type="button" onClick={() => removePromotion(index)} disabled={saving || uploading} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-red-600 disabled:opacity-40">Xóa</button>
                                                </div>
                                            </div>
                                            <label className="flex items-center gap-2 font-semibold">
                                                <input type="checkbox" checked={item.enabled !== false} disabled={saving || uploading} onChange={(e) => updatePromotion(index, "enabled", e.target.checked)} />
                                                Hiển thị trên trang chủ
                                            </label>
                                            {[
                                                ["badge", "Nhãn ưu đãi (ví dụ: TẶNG CAMERA AI)"],
                                                ["title", "Tiêu đề"],
                                                ["price", "Giá hiển thị"],
                                            ].map(([key, label]) => (
                                                <div key={key}>
                                                    <label htmlFor={`promotion-${key}-${index}`} className="mb-2 block font-semibold text-slate-700">{label}</label>
                                                    <input id={`promotion-${key}-${index}`} type="text" value={item[key] ?? ""} disabled={saving || uploading} onChange={(e) => updatePromotion(index, key, e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white p-3" />
                                                </div>
                                            ))}
                                            <div>
                                                <label htmlFor={`promotion-description-${index}`} className="mb-2 block font-semibold text-slate-700">Mô tả</label>
                                                <textarea id={`promotion-description-${index}`} rows={3} value={item.description ?? ""} disabled={saving || uploading} onChange={(e) => updatePromotion(index, "description", e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white p-3" />
                                            </div>
                                            <div>
                                                <label htmlFor={`promotion-image-${index}`} className="mb-2 block font-semibold text-slate-700">Ảnh khuyến mãi</label>
                                                {isValidImageUrl(item.image) && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={item.image} alt={`Ảnh khuyến mãi ${index + 1}`} className="mb-3 max-h-64 w-full rounded-xl object-contain" />
                                                )}
                                                <input id={`promotion-image-${index}`} type="file" accept="image/jpeg,image/png,image/webp" disabled={saving || uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadPromotionImage(file, index); e.target.value = ""; }} className="w-full rounded-xl border border-slate-300 bg-white p-3" />
                                                <p className="mt-2 break-all text-xs text-slate-500">{item.image || "Chưa có ảnh"}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {getPromotionItems().length === 0 && <p className="rounded-xl bg-slate-50 p-5 text-slate-500">Chưa có khuyến mãi. Nhấn “Thêm khuyến mãi” để bắt đầu.</p>}
                                </div>
                            )}

                            <div className="mt-8 flex flex-wrap gap-3">
                                <button type="submit" disabled={saving || uploading || loading} className="rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
                                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                                <Link href="/" target="_blank" rel="noopener noreferrer" className="rounded-xl border px-6 py-3 font-semibold text-slate-700">Xem website</Link>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </main>
    );
}
