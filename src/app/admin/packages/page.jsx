
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import PackagesManager from "./PackagesManager";

async function ProtectedPackagesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  return <PackagesManager />;
}

export default function AdminPackagesPage() {
  return (
    <Suspense fallback={<p className="p-8">Đang tải...</p>}>
      <ProtectedPackagesPage />
    </Suspense>
  );
}
