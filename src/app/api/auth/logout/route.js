
import { NextResponse } from "next/server";

export async function POST(request) {
  const response = NextResponse.redirect(
    new URL("/admin/login", request.url),
    { status: 303 }
  );

  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
