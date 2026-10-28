
import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ContentManager from "./ContentManager";

export default function AdminContentPage() {
  return (
    <Suspense fallback={<p className="p-10">Đang tải CMS...</p>}>
      <ProtectedContent />
    </Suspense>
  );
}

async function ProtectedContent() {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  return <ContentManager />;
}
