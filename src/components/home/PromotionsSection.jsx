import Image from "next/image";

export default async function PromotionsSection() {
  let content = {};
  try {
    const response = await fetch(
      `${process.env.SPRING_API_URL || "http://127.0.0.1:8080"}/api/content/promotions`,
      { cache: "no-store" }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    content = await response.json();
  } catch (error) {
    console.error("Không thể tải Promotions CMS:", error);
  }

  const promotions = (Array.isArray(content?.items) ? content.items : [])
    .filter((item) => item && item.enabled !== false);

  if (promotions.length === 0) return null;

  return (
    <section id="khuyen-mai" className="scroll-mt-24 bg-white px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">ƯU ĐÃI FPT TELECOM</span>
          <h2 className="mt-5 text-3xl font-black text-slate-900 sm:text-4xl">{content?.title || "Khuyến mãi nổi bật"}</h2>
          {content?.description && <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">{content.description}</p>}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {promotions.map((item, index) => {
            const image = typeof item.image === "string" ? item.image : "";
            const validImage = image.startsWith("/images/") || image.startsWith("https://res.cloudinary.com/");
            return (
              <article key={item.id || index} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                {validImage && (
                  <div className="relative aspect-[4/3] overflow-hidden bg-blue-50">
                    <Image src={image} alt={item.title || "Ưu đãi WiFi FPT"} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                  </div>
                )}
                <div className="p-6">
                  {item.badge && <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">{item.badge}</span>}
                  <h3 className="mt-3 text-xl font-black text-slate-900">{item.title}</h3>
                  {item.description && <p className="mt-3 leading-7 text-slate-600">{item.description}</p>}
                  {item.price && <p className="mt-5 text-2xl font-black text-orange-600">{item.price}</p>}
                  <a href="#lien-he" className="mt-6 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800">Đăng ký tư vấn</a>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-8 text-center text-xs text-slate-500">Ưu đãi tùy khu vực, thời điểm và điều kiện áp dụng.</p>
      </div>
    </section>
  );
}
