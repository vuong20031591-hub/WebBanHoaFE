import Image from "next/image";
import { ArrowRight } from "lucide-react";

const IMG_HERITAGE = "/images/heritage-main.png";

export function HeritageSection() {
  return (
    <section className="bg-[#fcfaf7] py-32">
      <div className="max-w-[1280px] mx-auto px-[160px]">
        <div className="flex items-start gap-24">
          <div className="relative w-[432px] shrink-0" style={{ height: "620px" }}>
            <div className="absolute top-[61px] left-0 w-[432px] h-[540px] rounded-3xl overflow-hidden shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
              <Image
                src={IMG_HERITAGE}
                alt="Our heritage"
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
                &ldquo;Every flower has a story, and we are here to help you tell it beautifully.&rdquo;
              </p>
              <p
                className="text-[#2d2a26] text-[10px] font-bold tracking-[2px]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                — ELENA, LEAD FLORIST
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-10 w-[432px]">
            <p
              className="text-[#d0bb95] text-[10px] font-bold tracking-[2px] uppercase"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              OUR HERITAGE
            </p>
            <h2
              className="text-[#2d2a26] text-[60px] font-light leading-[60px]"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              Crafting Emotions Through Floral Art
            </h2>
            <div
              className="flex flex-col gap-6 text-[#5c6b5e] text-[18px] font-light leading-[29.25px]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              <p>
                Born from a small garden in the heart of the city, Floral Boutique
                began with a simple mission: to elevate the everyday through the
                language of flowers. Our founder, Elena, believed that arrangements
                should be as unique as the moments they celebrate.
              </p>
              <p>
                Today, we work with local sustainable farms to bring you the
                freshest stems, arranged with a modern eye and a deep respect for
                nature&apos;s fleeting beauty.
              </p>
            </div>
            <button
              className="flex items-center gap-2 text-[#d0bb95] text-[16px] font-medium pb-1 w-fit hover:opacity-80 transition-opacity border-b border-[rgba(208,187,149,0.4)] hover:border-[#d0bb95]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Read More About Us
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
