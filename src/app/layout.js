
import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Lắp WiFi FPT | Tư vấn Internet tốc độ cao",
    template: "%s | WiFi FPT",
  },
  description:
    "Tư vấn lắp đặt Internet WiFi FPT, tìm hiểu gói cước, " +
    "ưu đãi và đăng ký kiểm tra hạ tầng tại khu vực của bạn.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
