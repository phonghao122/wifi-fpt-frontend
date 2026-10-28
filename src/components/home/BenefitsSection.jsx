
const defaultBenefits = [
  {
    icon: "⚡",
    title: "Internet tốc độ cao",
    description: "Tư vấn gói cước phù hợp nhu cầu sử dụng.",
  },
  {
    icon: "📷",
    title: "Ưu đãi Camera AI",
    description: "Kiểm tra chương trình và điều kiện áp dụng.",
  },
  {
    icon: "📺",
    title: "Truyền hình giải trí",
    description: "Tìm hiểu các gói combo Internet và truyền hình.",
  },
];

export default async function BenefitsSection() {
  let content = {};

  try {
    const response = await fetch(
      `${process.env.SPRING_API_URL || "http://127.0.0.1:8080"}/api/content/benefits`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Benefits API: ${response.status}`);
    }

    content = await response.json();
  } catch (error) {
    console.error("Không thể tải Benefits CMS:", error);
  }

  const title =
    content?.title || "Vì sao nên tìm hiểu Internet FPT?";

  const benefits = Array.isArray(content?.items)
    ? content.items
    : defaultBenefits;

  return (
    <section
      id="uu-dai"
      className="scroll-mt-24 bg-blue-50 px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-3xl font-black text-slate-900">
          {title}
        </h2>

        {content?.description && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            {content.description}
          </p>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {benefits.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white p-7 shadow-sm"
            >
              <span className="text-4xl" aria-hidden="true">
                {item.icon}
              </span>

              <h3 className="mt-5 text-xl font-bold">
                {item.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
