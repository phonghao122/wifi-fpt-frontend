
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.SPRING_API_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { message: "Tài khoản hoặc mật khẩu không đúng" },
        { status: response.status === 401 ? 401 : 502 }
      );
    }

    const data = await response.json();

    if (!data.accessToken) {
      return NextResponse.json(
        { message: "Backend không trả về JWT" },
        { status: 502 }
      );
    }

    const result = NextResponse.json({
      success: true,
      message: "Đăng nhập thành công",
    });

    result.cookies.set("admin_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.min(data.expiresIn ?? 3600, 3600),
    });

    return result;
  } catch (error) {
    console.error("Admin login failed:", error.message);

    return NextResponse.json(
      { message: "Không thể kết nối máy chủ" },
      { status: 500 }
    );
  }
}
