
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const backendUrl =
      process.env.SPRING_API_URL || "http://127.0.0.1:8080";

    const response = await fetch(`${backendUrl}/api/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json().catch(() => ({
      message: "Phản hồi từ máy chủ không hợp lệ",
    }));

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Lead API error:", error.message);

    return NextResponse.json(
      {
        saved: false,
        message: "Không thể kết nối máy chủ. Vui lòng thử lại.",
      },
      { status: 502 }
    );
  }
}
