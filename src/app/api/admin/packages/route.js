
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL =
  process.env.SPRING_API_URL || "http://127.0.0.1:8080";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value;
}

export async function GET() {
  const token = await getToken();

  if (!token) {
    return NextResponse.json(
      { error: "Chưa đăng nhập" },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${API_URL}/api/admin/packages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { error: "Không kết nối được Spring Boot" },
      { status: 502 }
    );
  }
}

export async function POST(request) {
  const token = await getToken();

  if (!token) {
    return NextResponse.json(
      { error: "Chưa đăng nhập" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/api/admin/packages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { error: "Không thể tạo gói cước" },
      { status: 502 }
    );
  }
}
