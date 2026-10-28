
import PackageCard from "./PackageCard";

async function getPackages() {
  const apiUrl =
    process.env.SPRING_API_URL || "http://127.0.0.1:8080";

  const response = await fetch(`${apiUrl}/api/packages`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Không thể tải danh sách gói cước: ${response.status}`
    );
  }

  return response.json();
}

export default async function PackagesSection() {
  const data = await getPackages();

  // Giữ tương thích với PackageCard hiện tại
  const packages = data.map((item) => ({
    ...item,
    id: item.code,
  }));

  return (
    <section
      id="goi-cuoc"
      className="scroll-mt-24 bg-white px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="font-bold text-orange-500">
            GÓI CƯỚC INTERNET
          </p>

          <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
            Chọn gói WiFi phù hợp
          </h2>

          <p className="mt-4 text-slate-500">
            Giá tham khảo. Vui lòng xác nhận ưu đãi tại khu vực lắp đặt.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((item) => (
            <PackageCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
