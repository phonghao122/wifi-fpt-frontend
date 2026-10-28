
"use client";

import { useState } from "react";
import { packages } from "@/data/packages";
import { locations } from "@/data/locations";
import { normalizePhone, validateLead } from "@/lib/validation";

const initialForm = {
    fullName: "",
    phone: "",
    province: "",
    packageId: "",
    address: "",
    consent: false,
};

export default function LeadForm() {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    function updateField(name, value) {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));

        setMessage("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading) return;

        setMessage("");
        setErrors({});

        // Chuẩn hóa dữ liệu trước khi kiểm tra
        const payload = {
            ...form,
            fullName: form.fullName.trim(),
            phone: normalizePhone(form.phone),
            address: form.address.trim(),
        };

        // Kiểm tra dữ liệu trên frontend
        const validationErrors = validateLead(payload);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setMessageType("error");
            setMessage("Vui lòng kiểm tra lại thông tin đăng ký.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/leads", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Không thể gửi đăng ký."
                );
            }

            if (data.saved !== true) {
                throw new Error(
                    "Máy chủ chưa xác nhận lưu đăng ký."
                );
            }

            setMessageType("success");
            setMessage(
                "Đăng ký thành công! Nhân viên FPT sẽ liên hệ tư vấn sớm."
            );

            // Xóa dữ liệu sau khi lưu thành công
            setForm({ ...initialForm });
            setErrors({});

            console.log("Lead ID:", data.leadId);
        } catch (error) {
            setMessageType("error");
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Có lỗi xảy ra. Vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    }

    const inputClass =
        "w-full rounded-xl border border-slate-300 " +
        "bg-white px-4 py-3 text-slate-900 " +
        "outline-none focus:border-blue-600 " +
        "focus:ring-2 focus:ring-blue-100";

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
        >
            <div>
                <h3 className="text-2xl font-bold text-slate-900">
                    Đăng ký tư vấn miễn phí
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                    Điền thông tin để kiểm tra gói cước phù hợp.
                </p>
            </div>

            <div>
                <label
                    htmlFor="fullName"
                    className="mb-2 block font-medium"
                >
                    Họ và tên *
                </label>
                <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    className={inputClass}
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChange={(e) =>
                        updateField("fullName", e.target.value)
                    }
                    aria-invalid={!!errors.fullName}
                />
                {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.fullName}
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="phone"
                    className="mb-2 block font-medium"
                >
                    Số điện thoại *
                </label>
                <input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    className={inputClass}
                    placeholder="09xxxxxxxx"
                    value={form.phone}
                    onChange={(e) =>
                        updateField("phone", e.target.value)
                    }
                    aria-invalid={!!errors.phone}
                />
                {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.phone}
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="province"
                    className="mb-2 block font-medium"
                >
                    Tỉnh / Thành phố *
                </label>
                <select
                    id="province"
                    className={inputClass}
                    value={form.province}
                    onChange={(e) =>
                        updateField("province", e.target.value)
                    }
                    aria-invalid={!!errors.province}
                >
                    <option value="">
                        Chọn tỉnh/thành phố
                    </option>
                    {locations.map((location) => (
                        <option
                            key={location.value}
                            value={location.value}
                        >
                            {location.label}
                        </option>
                    ))}
                </select>
                {errors.province && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.province}
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="packageId"
                    className="mb-2 block font-medium"
                >
                    Gói cước quan tâm *
                </label>
                <select
                    id="packageId"
                    className={inputClass}
                    value={form.packageId}
                    onChange={(e) =>
                        updateField("packageId", e.target.value)
                    }
                    aria-invalid={!!errors.packageId}
                >
                    <option value="">
                        Chọn gói cước
                    </option>
                    {packages.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>
                {errors.packageId && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.packageId}
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="address"
                    className="mb-2 block font-medium"
                >
                    Địa chỉ lắp đặt (không bắt buộc)
                </label>
                <input
                    id="address"
                    type="text"
                    maxLength={200}
                    className={inputClass}
                    placeholder="Phường/xã, đường hoặc khu vực"
                    value={form.address}
                    onChange={(e) =>
                        updateField("address", e.target.value)
                    }
                    aria-invalid={!!errors.address}
                />
                {errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.address}
                    </p>
                )}
            </div>

            <div>
                <label className="flex items-start gap-3 text-sm text-slate-600">
                    <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-blue-700"
                        checked={form.consent}
                        onChange={(e) =>
                            updateField(
                                "consent",
                                e.target.checked
                            )
                        }
                        aria-invalid={!!errors.consent}
                    />
                    <span>
                        Tôi đồng ý cung cấp thông tin để được
                        liên hệ tư vấn theo chính sách xử lý
                        dữ liệu của website.
                    </span>
                </label>

                {errors.consent && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.consent}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-orange-500 px-6 py-4 font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
                {loading
                    ? "Đang gửi đăng ký..."
                    : "Đăng ký tư vấn ngay"}
            </button>

            {message && (
                <div
                    role={messageType === "error" ? "alert" : "status"}
                    aria-live="polite"
                    className={
                        "mt-4 rounded-xl border p-4 text-sm font-medium " +
                        (messageType === "success"
                            ? "border-green-200 bg-green-50 text-green-800"
                            : "border-red-200 bg-red-50 text-red-800")
                    }
                >
                    {message}
                </div>
            )}

            <p className="text-center text-xs text-slate-500">
                Thông tin đăng ký được sử dụng để liên hệ
                và tư vấn dịch vụ WiFi FPT.
            </p>
        </form>
    );
}
