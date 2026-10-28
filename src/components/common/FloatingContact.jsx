
const DEFAULT_HOTLINE = "0905 88 60 63";

function safeHttpsUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

async function getContactContent() {
  try {
    const response = await fetch(
      `${process.env.SPRING_API_URL || "http://127.0.0.1:8080"}/api/content/contact`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Contact API: ${response.status}`);
    }

    const data = await response.json();

    return data && typeof data === "object" && !Array.isArray(data)
      ? data
      : {};
  } catch (error) {
    console.error("Không thể tải FloatingContact:", error);
    return {};
  }
}

export default async function FloatingContact() {
  const content = await getContactContent();

  const hotline = content.hotline || DEFAULT_HOTLINE;
  const phoneNumber = hotline.replace(/[^\d+]/g, "");
  const canCall = /^\+?\d{9,15}$/.test(phoneNumber);

  const zaloUrl = safeHttpsUrl(content.zaloUrl);
  const facebookUrl = safeHttpsUrl(content.facebookUrl);
  const registrationUrl = safeHttpsUrl(content.registrationUrl);

  const buttons = [];

  if (content.showHotline !== false && canCall) {
    buttons.push({
      label: "Gọi tư vấn",
      href: `tel:${phoneNumber}`,
      color: "bg-blue-700",
    });
  }

  if (content.showZalo !== false && zaloUrl) {
    buttons.push({
      label: "Zalo",
      href: zaloUrl,
      color: "bg-blue-500",
      external: true,
    });
  }

  if (content.showFacebook !== false && facebookUrl) {
    buttons.push({
      label: "Messenger",
      href: facebookUrl,
      color: "bg-indigo-600",
      external: true,
    });
  }

  if (content.showRegistration !== false && registrationUrl) {
    buttons.push({
      label: "Đăng ký FPT",
      href: registrationUrl,
      color: "bg-orange-500",
      external: true,
    });
  } else {
    buttons.push({
      label: "Đăng ký ngay",
      href: "#lien-he",
      color: "bg-orange-500",
    });
  }

  if (buttons.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white p-3 shadow-2xl sm:hidden">
      <div className="grid grid-cols-2 gap-2">
        {buttons.map((button) => (
          <a
            key={button.label}
            href={button.href}
            target={button.external ? "_blank" : undefined}
            rel={
              button.external
                ? "noopener noreferrer"
                : undefined
            }
            className={`rounded-xl ${button.color} px-2 py-3 text-center text-xs font-bold text-white`}
          >
            {button.label}
          </a>
        ))}
      </div>
    </div>
  );
}
