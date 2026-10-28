import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ALLOWED = new Set(["NEW", "CONTACTED", "CONVERTED", "CANCELLED"]);

export async function PATCH(request, { params }) {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id)) {
    return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
  }

  // Chỉ chấp nhận JSON và các trường được phép cập nhật.
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "JSON không hợp lệ" }, { status: 400 });
  }
  if (!body || !ALLOWED.has(body.status) || typeof body.adminNote !== "string" || body.adminNote.length > 5000) {
    return NextResponse.json({ error: "Dữ liệu cập nhật không hợp lệ" }, { status: 400 });
  }

  try {
    const response = await fetch(`${process.env.SPRING_API_URL}/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status: body.status, adminNote: body.adminNote }),
      cache: "no-store",
    });
    if (!response.ok) {
      return NextResponse.json({ error: "Không thể cập nhật khách hàng" }, { status: response.status });
    }
    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("CRM update failed:", error);
    return NextResponse.json({ error: "Không kết nối được Spring Boot" }, { status: 502 });
  }
}
