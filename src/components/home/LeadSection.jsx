
import LeadForm from "@/components/forms/LeadForm";

const DEFAULT_CONTACT = {
  title: "Tìm gói WiFi phù hợp cho gia đình bạn",
  description:
    "Cung cấp thông tin để được tư vấn gói cước, kiểm tra hạ tầng và tìm hiểu các chương trình ưu đãi phù hợp với khu vực lắp đặt.",
  hotline: "0905 88 60 63",
  zaloUrl: "",
  facebookUrl: "",
  registrationUrl: "",
  showHotline: true,
  showZalo: true,
  showFacebook: true,
  showRegistration: true,
};

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

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return DEFAULT_CONTACT;
    }

    return { ...DEFAULT_CONTACT, ...data };
  } catch (error) {
    console.error("Không thể tải Contact CMS:", error);
    return DEFAULT_CONTACT;
  }
}

export default async function LeadSection() {
  const content = await getContactContent();

  const title = content.title || DEFAULT_CONTACT.title;
  const description =
    content.description || DEFAULT_CONTACT.description;

  const hotline = content.hotline || DEFAULT_CONTACT.hotline;
  const phoneNumber = hotline.replace(/[^\d+]/g, "");
  const canCall = /^\+?\d{9,15}$/.test(phoneNumber);

  const zaloUrl = safeHttpsUrl(content.zaloUrl);
  const facebookUrl = safeHttpsUrl(content.facebookUrl);
  const registrationUrl = safeHttpsUrl(content.registrationUrl);

  return (
    <section
      id="lien-he"
      className="scroll-mt-24 bg-gradient-to-br from-blue-50 to-white px-4 py-20 sm:px-6"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="font-bold uppercase text-orange-600">
            Đăng ký Internet FPT
          </p>

          <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
            {title}
          </h2>

          <p className="mt-6 whitespace-pre-line text-lg leading-8 text-slate-600">
            {description}
          </p>

          <div className="mt-8 space-y-4 text-slate-700">
            <p>✓ Tư vấn gói cước theo nhu cầu</p>
            <p>✓ Kiểm tra khu vực hỗ trợ lắp đặt</p>
            <p>✓ Cung cấp thông tin ưu đãi hiện hành</p>
          </div>

          <div className="mt-8 rounded-xl border border-blue-100 bg-white p-5">
            <p className="font-semibold text-slate-800">
              Cần tư vấn trực tiếp?
            </p>

            {content.showHotline !== false && canCall && (
              <a
                href={`tel:${phoneNumber}`}
                className="mt-2 inline-block text-xl font-black text-blue-700"
              >
                {hotline}
              </a>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              {content.showZalo !== false && zaloUrl && (
                <a
                  href={zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
                >
                  Chat Zalo
                </a>
              )}

              {content.showFacebook !== false && facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700"
                >
                  Messenger
                </a>
              )}

              {content.showRegistration !== false &&
                registrationUrl && (
                  <a
                    href={registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600"
                  >
                    Đăng ký trực tuyến
                  </a>
                )}
            </div>
          </div>
        </div>

        <LeadForm />
      </div>
    </section>
  );
}
