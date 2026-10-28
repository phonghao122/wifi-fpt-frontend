
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL =
  process.env.SPRING_API_URL || "http://127.0.0.1:8080";

const MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function POST(request) {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Chưa đăng nhập" },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Vui lòng chọn ảnh" },
        { status: 400 }
      );
    }

    if (
      file.size === 0 ||
      file.size > MAX_SIZE ||
      !ALLOWED_TYPES.has(file.type)
    ) {
      return NextResponse.json(
        { error: "Ảnh phải là JPG, PNG hoặc WebP, tối đa 5 MB" },
        { status: 400 }
      );
    }

    const uploadData = new FormData();
    uploadData.append("file", file, file.name);

    const response = await fetch(
      `${API_URL}/api/admin/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.detail ||
            data.message ||
            data.error ||
            "Upload ảnh thất bại",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("Image upload failed:", error);

    return NextResponse.json(
      { error: "Không thể kết nối máy chủ upload" },
      { status: 502 }
    );
  }
}
