
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import PackagesSection from "@/components/home/PackagesSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import LeadSection from "@/components/home/LeadSection";
import FloatingContact from "@/components/common/FloatingContact";
import PromotionsSection from "@/components/home/PromotionsSection";
import { Suspense } from "react";

async function HeroContent() {
  let content = {};

  try {
    const response = await fetch(
      `${process.env.SPRING_API_URL || "http://127.0.0.1:8080"}/api/content/hero`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Không thể tải Hero CMS: ${response.status}`
      );
    }

    content = await response.json();
  } catch (error) {
    console.error("Lỗi tải Hero CMS:", error);
  }

  return <Hero content={content} />;
}

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        <Suspense fallback={<Hero />}>
          <HeroContent />
        </Suspense>

        <Suspense
          fallback={
            <div className="py-20 text-center text-slate-500">
              Đang tải gói cước...
            </div>
          }
        >
          <PackagesSection />
        </Suspense>

        <Suspense
          fallback={
            <div className="bg-blue-50 py-20 text-center text-slate-500">
              Đang tải lợi ích FPT...
            </div>
          }
        >
          <Suspense fallback={null}>
            <PromotionsSection />
          </Suspense>
          <BenefitsSection />
        </Suspense>
        <Suspense fallback={null}>
          <LeadSection />
        </Suspense>
      </main>

      <Footer />
      <Suspense fallback={null}>
        <FloatingContact />
      </Suspense>
    </>
  );
}
