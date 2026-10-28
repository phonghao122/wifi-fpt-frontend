
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL =
    process.env.SPRING_API_URL || "http://127.0.0.1:8080";

async function forwardRequest(request, context, method) {
    const { id } = await context.params;

    if (!/^\d+$/.test(id)) {
        return NextResponse.json(
            { error: "ID không hợp lệ" },
            { status: 400 }
        );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

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
            `${API_URL}/api/admin/packages/${id}`,
            options
        );

        if (response.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        const data = await response.json().catch(() => ({}));

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

export async function PUT(request, context) {
    return forwardRequest(request, context, "PUT");
}

export async function DELETE(request, context) {
    return forwardRequest(request, context, "DELETE");
}
