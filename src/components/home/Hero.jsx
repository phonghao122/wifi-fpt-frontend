
import Image from "next/image";

export default function Hero({ content = {} }) {
  const title = content.title || "Lắp WiFi FPT";
  const description =
    content.description ||
    "Tư vấn gói Internet phù hợp nhu cầu, hỗ trợ kiểm tra hạ tầng và đăng ký lắp đặt.";

  const price = content.price || "195.000đ/tháng";
  const imageUrl = content.image || "/images/image.png";

  return (
    <section className="overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="mb-5 inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
            TƯ VẤN LẮP ĐẶT INTERNET FPT
          </p>

          <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {title}
            <span className="block text-blue-700">
              Tốc độ cao
            </span>
            <span className="block text-orange-500">
              Giá hợp lý
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            {description}
          </p>

          <div className="mt-7 flex flex-wrap items-baseline gap-2">
            <span className="text-slate-600">
              Giá tham khảo từ
            </span>
            <strong className="text-3xl font-black text-orange-600">
              {price}
            </strong>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#lien-he"
              className="rounded-xl bg-orange-500 px-7 py-4 font-bold text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600"
            >
              Đăng ký tư vấn
            </a>

            <a
              href="#goi-cuoc"
              className="rounded-xl border-2 border-blue-700 px-7 py-4 font-bold text-blue-700 transition hover:bg-blue-50"
            >
              Xem bảng giá
            </a>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            Giá và ưu đãi tùy khu vực, thời điểm và điều kiện áp dụng.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-blue-100/50 blur-3xl" />

          <Image
            src={imageUrl}
            alt="Thiết bị phát WiFi cho gia đình"
            width={800}
            height={650}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="relative h-auto w-full rounded-3xl object-cover shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}
