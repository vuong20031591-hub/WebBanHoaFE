"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/src/contexts";

const IMG_HERO = "/images/hero-main.png";

export function HeroSection() {
  const { locale } = useLocale();
  const copy =
    locale === "vi"
      ? {
          badge: "BỘ SƯU TẬP CAO CẤP 2024",
          title: "Nghệ thuật trong từng cánh hoa",
          description:
            "Trải nghiệm vẻ thanh lịch của những mẫu hoa cao cấp, được chăm chút thủ công cho những khoảnh khắc đẹp nhất cuộc đời.",
          primaryCta: "Mua bộ sưu tập",
          secondaryCta: "Xem lookbook",
          imageAlt: "Lẵng hoa cao cấp",
        }
      : {
          badge: "LUXURY COLLECTION 2024",
          title: "Artistry in Every Petal",
          description:
            "Experience the elegance of premium floral arrangements, hand-crafted for life's most beautiful moments.",
          primaryCta: "Shop Collection",
          secondaryCta: "View Lookbook",
          imageAlt: "Premium floral arrangement",
        };

  return (
    <section className="bg-[#fcfaf7] h-[calc(100vh-81px)] flex items-center overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-[160px] w-full">
        <div className="flex items-center gap-16">
          <div className="flex flex-col gap-10 w-[448px] shrink-0">
            <div className="flex flex-col gap-6">
              <p
                className="text-[#d0bb95] text-[11px] font-bold tracking-[3.3px] uppercase"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {copy.badge}
              </p>
              <h1
                className="text-[#2d2a26] text-[clamp(56px,6vw,96px)] font-light leading-[1.05] tracking-[-2.4px]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                {copy.title}
              </h1>
              <p
                className="text-[#5c6b5e] text-[20px] font-light leading-[28px]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {copy.description}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/products"
                className="bg-[#d0bb95] border border-[rgba(208,187,149,0.4)] text-white text-[14px] font-medium px-10 py-4 rounded-3xl hover:bg-[#c2a571] transition-colors"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {copy.primaryCta}
              </Link>
              <Link
                href="/products?sort=latest"
                className="bg-white border border-[rgba(208,187,149,0.4)] text-[#2d2a26] text-[14px] font-medium px-10 py-4 rounded-3xl hover:bg-[#fcfaf7] transition-colors"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {copy.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="relative w-[448px] shrink-0" style={{ height: "min(560px, calc(100vh - 200px))" }}>
            <div className="absolute w-[224px] h-[224px] bg-[rgba(208,187,149,0.2)] rounded-tl-[200px] rounded-tr-[200px] rounded-bl-[20px] rounded-br-[20px] left-[-64px] top-[378px] pointer-events-none" />
            <div className="absolute w-[149px] h-[149px] bg-[rgba(208,187,149,0.3)] rounded-tl-[200px] rounded-tr-[200px] rounded-bl-[20px] rounded-br-[20px] right-[-32px] top-[-32px] border border-[rgba(208,187,149,0.2)] pointer-events-none" />
            <div className="relative w-full h-full rounded-tl-[200px] rounded-tr-[200px] rounded-bl-[20px] rounded-br-[20px] overflow-hidden shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)]">
              <Image
                src={IMG_HERO}
                alt={copy.imageAlt}
                fill
                sizes="448px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
