
export default function Footer() {
  return (
    <footer className="bg-slate-900 px-4 py-12 pb-28 text-white sm:pb-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-2xl font-black">
          WiFi <span className="text-orange-400">FPT</span>
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
          Kênh tư vấn đăng ký Internet FPT. Thông tin gói cước
          và ưu đãi cần được xác nhận theo khu vực lắp đặt.
        </p>

        <p className="mt-5 text-sm">
          Hotline:{" "}
          <a className="font-bold" href="tel:0905886063">
            0905 88 60 63
          </a>
        </p>

        <p className="mt-6 text-xs text-slate-400">
          © 2026 WiFi FPT – Kênh tư vấn.
        </p>
      </div>
    </footer>
  );
}
