"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/src/contexts";

const IMG_HERITAGE = "/images/heritage-main.png";

export function HeritageSection() {
  const { locale } = useLocale();
  const copy =
    locale === "vi"
      ? {
          imageAlt: "Di sản của chúng tôi",
          quote: "Mỗi bông hoa đều có câu chuyện riêng, và chúng tôi ở đây để giúp bạn kể câu chuyện ấy thật đẹp.",
          author: "MINH QUAN, NGHỆ NHÂN HOA CHÍNH",
          badge: "DI SẢN CỦA CHÚNG TÔI",
          title: "Chạm khắc cảm xúc qua nghệ thuật hoa",
          paragraphOne:
            "Bắt đầu từ một khu vườn nhỏ giữa lòng thành phố, Floral Boutique ra đời với sứ mệnh giản dị: nâng niu đời sống thường nhật bằng ngôn ngữ của hoa. Nhà sáng lập Elena luôn tin rằng mỗi thiết kế hoa phải độc bản như chính khoảnh khắc mà nó tôn vinh.",
          paragraphTwo:
            "Ngày nay, chúng tôi hợp tác với các nông trại địa phương theo định hướng bền vững để mang đến những cành hoa tươi nhất, được phối bằng góc nhìn hiện đại và sự trân trọng vẻ đẹp mong manh của tự nhiên.",
          cta: "Đọc thêm về chúng tôi",
        }
      : {
          imageAlt: "Our heritage",
          quote: "Every flower has a story, and we are here to help you tell it beautifully.",
          author: "ELENA, LEAD FLORIST",
          badge: "OUR HERITAGE",
          title: "Crafting Emotions Through Floral Art",
          paragraphOne:
            "Born from a small garden in the heart of the city, Floral Boutique began with a simple mission: to elevate the everyday through the language of flowers. Our founder, Elena, believed that arrangements should be as unique as the moments they celebrate.",
          paragraphTwo:
            "Today, we work with local sustainable farms to bring you the freshest stems, arranged with a modern eye and a deep respect for nature's fleeting beauty.",
          cta: "Read More About Us",
        };

  return (
    <section className="bg-[#fcfaf7] py-32">
      <div className="max-w-[1280px] mx-auto px-[160px]">
        <div className="flex items-start gap-24">
          <div className="relative w-[432px] shrink-0" style={{ height: "620px" }}>
            <div className="absolute top-[61px] left-0 w-[432px] h-[540px] rounded-3xl overflow-hidden shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
              <Image
                src={IMG_HERITAGE}
                alt={copy.imageAlt}
                fill
                sizes="432px"
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-[88px] w-[384px] bg-white/95 backdrop-blur-sm rounded-2xl px-10 py-10 shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1)] border border-[rgba(208,187,149,0.1)]">
              <p
                className="text-[#d0bb95] text-[20px] font-light leading-[32.5px] mb-4"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                &ldquo;{copy.quote}&rdquo;
              </p>
              <p
                className="text-[#2d2a26] text-[10px] font-bold tracking-[2px]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                — {copy.author}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-10 w-[432px]">
            <p
              className="text-[#d0bb95] text-[10px] font-bold tracking-[2px] uppercase"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {copy.badge}
            </p>
            <h2
              className="text-[#2d2a26] text-[60px] font-light leading-[60px]"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              {copy.title}
            </h2>
            <div
              className="flex flex-col gap-6 text-[#5c6b5e] text-[18px] font-light leading-[29.25px]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              <p>
                {copy.paragraphOne}
              </p>
              <p>
                {copy.paragraphTwo}
              </p>
            </div>
            <Link
              href="/our-story"
              className="flex items-center gap-2 text-[#d0bb95] text-[16px] font-medium pb-1 w-fit hover:opacity-80 transition-opacity border-b border-[rgba(208,187,149,0.4)] hover:border-[#d0bb95]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {copy.cta}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
