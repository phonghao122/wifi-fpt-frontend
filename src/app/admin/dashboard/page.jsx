
import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardClient from "./DashboardClient";

export default function AdminDashboardPage({ searchParams }) {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-slate-50 p-10 text-center">
                    Đang tải CRM...
                </div>
            }
        >
            <DashboardContent searchParams={searchParams} />
        </Suspense>
    );
}

async function DashboardContent({ searchParams }) {
    // 1. Kiểm tra đăng nhập Admin
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
        redirect("/admin/login");
    }

    // 2. Xử lý tìm kiếm, lọc trạng thái và phân trang
    const params = await searchParams;

    const keyword =
        typeof params?.keyword === "string"
            ? params.keyword.trim().slice(0, 100)
            : "";

    const allowedStatuses = [
        "NEW",
        "CONTACTED",
        "CONVERTED",
        "CANCELLED",
    ];

    const status = allowedStatuses.includes(params?.status)
        ? params.status
        : "";

    const parsedPage = Number(params?.page ?? 0);

    const page =
        Number.isSafeInteger(parsedPage) && parsedPage >= 0
            ? parsedPage
            : 0;

    const query = new URLSearchParams({
        keyword,
        status,
        page: String(page),
        size: "20",
    });

    // 3. Lấy dữ liệu CRM từ Spring Boot
    let leadsData;
    let stats;

    try {
        const [leadsRes, statsRes] = await Promise.all([
            fetch(
                `${process.env.SPRING_API_URL}/api/admin/leads?${query}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            ),

            fetch(
                `${process.env.SPRING_API_URL}/api/admin/leads/stats`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            ),
        ]);

        // JWT hết hạn hoặc không đủ quyền
        if (
            [leadsRes.status, statsRes.status].some(
                (code) => code === 401 || code === 403
            )
        ) {
            redirect("/admin/login");
        }

        if (!leadsRes.ok || !statsRes.ok) {
            throw new Error(
                `Backend trả về ${leadsRes.status} / ${statsRes.status}`
            );
        }

        [leadsData, stats] = await Promise.all([
            leadsRes.json(),
            statsRes.json(),
        ]);
    } catch (error) {
        // Cho phép Next.js xử lý redirect
        if (error?.digest?.startsWith("NEXT_REDIRECT")) {
            throw error;
        }

        console.error("CRM load failed:", error);

        return (
            <main className="min-h-screen bg-slate-50 p-10 text-center">
                <h1 className="text-xl font-bold text-red-600">
                    Không thể tải CRM
                </h1>

                <p className="mt-3 text-slate-600">
                    Kiểm tra Spring Boot tại localhost:8080
                    và API /api/admin/leads/stats.
                </p>

                <Link
                    href="/admin/dashboard"
                    className="mt-5 inline-block text-orange-600 underline"
                >
                    Thử lại
                </Link>
            </main>
        );
    }

    // 4. Dashboard CRM + điều hướng quản lý gói cước
    return (
        <div className="min-h-screen bg-slate-50">

            {/* Thanh điều hướng quản trị */}
            <div className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">

                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                            FPT TELECOM
                        </p>

                        <p className="text-lg font-black text-slate-900">
                            Hệ thống quản trị
                        </p>
                    </div>

                    <nav className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/admin/dashboard"
                            className="rounded-xl bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700"
                        >
                            Quản lý khách hàng
                        </Link>

                        <Link
                            href="/admin/packages"
                            className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                        >
                            Quản lý gói cước
                        </Link>

                        <Link
                            href="/admin/content"
                            className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
                        >
                            Quản lý nội dung
                        </Link>

                        <Link
                            href="/"
                            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Xem website
                        </Link>
                    </nav>
                </div>
            </div>

            {/* Giữ nguyên toàn bộ chức năng CRM */}
            <DashboardClient
                leads={
                    Array.isArray(leadsData.content)
                        ? leadsData.content
                        : []
                }
                totalElements={leadsData.totalElements ?? 0}
                totalPages={leadsData.totalPages ?? 0}
                stats={stats}
                keyword={keyword}
                status={status}
                page={page}
            />

        </div>
    );
}
