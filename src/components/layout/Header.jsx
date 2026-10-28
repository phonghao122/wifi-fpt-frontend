
import Link from "next/link";

const menuItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Gói cước", href: "/#goi-cuoc" },
  { label: "Ưu đãi", href: "/#uu-dai" },
  { label: "Liên hệ", href: "/#lien-he" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-2xl font-black tracking-tight text-blue-700"
        >
          WiFi <span className="text-orange-500">FPT</span>
        </Link>

        <nav
          aria-label="Điều hướng chính"
          className="hidden items-center gap-7 lg:flex"
        >
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-slate-600 transition hover:text-blue-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href="tel:0905886063"
          className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          Gọi 0905 88 60 63
        </a>
      </div>
    </header>
  );
}
