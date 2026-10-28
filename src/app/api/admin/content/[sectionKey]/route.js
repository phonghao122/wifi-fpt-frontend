
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL =
  process.env.SPRING_API_URL || "http://127.0.0.1:8080";

const ALLOWED = new Set([
  "hero",
  "benefits",
  "contact",
  "promotions",
]);

async function proxy(request, context, method) {
  const { sectionKey } = await context.params;

  if (!ALLOWED.has(sectionKey)) {
    return NextResponse.json(
      { error: "Khu vực nội dung không hợp lệ" },
      { status: 400 }
    );
  }

  const token = (await cookies()).get("admin_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Chưa đăng nhập" },
      { status: 401 }
    );
  }

  try {
    const options = {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    };

    if (method === "PUT") {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(await request.json());
    }

    const response = await fetch(
      `${API_URL}/api/admin/content/${sectionKey}`,
      options
    );

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { error: "Không thể kết nối Spring Boot" },
      { status: 502 }
    );
  }
}

export async function GET(request, context) {
  return proxy(request, context, "GET");
}

export async function PUT(request, context) {
  return proxy(request, context, "PUT");
}
