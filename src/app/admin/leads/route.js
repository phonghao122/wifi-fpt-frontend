
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Bạn chưa đăng nhập" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(0, Number(searchParams.get("page")) || 0);

  try {
    const response = await fetch(
      `${process.env.SPRING_API_URL}/api/admin/leads?page=${page}&size=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { message: "Không thể tải danh sách khách hàng" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Fetch admin leads failed:", error.message);

    return NextResponse.json(
      { message: "Lỗi kết nối backend" },
      { status: 502 }
    );
  }
}
