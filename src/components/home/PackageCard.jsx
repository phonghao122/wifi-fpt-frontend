
import { formatPrice } from "@/data/packages";

export default function PackageCard({ item }) {
  return (
    <article
      className={`relative flex h-full flex-col rounded-2xl border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
        item.featured
          ? "border-2 border-orange-500"
          : "border-slate-200"
      }`}
    >
      {item.featured && (
        <span className="absolute -top-4 left-6 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white">
          GÓI NỔI BẬT
        </span>
      )}

      <h3 className="text-2xl font-black text-blue-800">
        {item.name}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {item.description}
      </p>

      <div className="mt-6">
        <span className="text-3xl font-black text-orange-600">
          {formatPrice(item.price)}đ
        </span>
        <span className="text-sm text-slate-500">/tháng</span>
      </div>

      <p className="mt-4 rounded-lg bg-blue-50 p-3 font-semibold text-blue-800">
        {item.speed}
      </p>

      <ul className="my-7 flex-1 space-y-4">
        {item.features.map((feature) => (
          <li
            key={feature}
            className="flex gap-3 text-sm text-slate-600"
          >
            <span className="font-bold text-green-600">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <a
        href="#lien-he"
        className={`block rounded-xl px-5 py-4 text-center font-bold transition ${
          item.featured
            ? "bg-orange-500 text-white hover:bg-orange-600"
            : "bg-blue-700 text-white hover:bg-blue-800"
        }`}
      >
        Đăng ký gói {item.name}
      </a>
    </article>
  );
}
