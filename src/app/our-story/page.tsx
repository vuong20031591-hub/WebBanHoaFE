"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Flower2,
  HeartHandshake,
  Leaf,
  Recycle,
  Sparkles,
} from "lucide-react";
import { Footer, Navbar } from "@/components/layout";
import { useLocale } from "@/src/contexts";

const HERO_IMAGE = "/images/hero-main.png";
const STORY_IMAGE_LEFT = "/images/birthday.png";
const STORY_IMAGE_RIGHT = "/images/gallery-photo.png";
const FOUNDER_IMAGE = "/images/process-step-2.png";
const VALUE_IMAGE_1 = "/images/anniversary.png";
const VALUE_IMAGE_2 = "/images/sympathy.png";

export default function OurStoryPage() {
  const { locale } = useLocale();
  const copy =
    locale === "vi"
      ? {
          journeyBadge: "Hành trình của chúng tôi",
          heroTitle: "Câu chuyện của chúng tôi:\nNghệ thuật trong\ntừng cánh hoa",
          heroDescription:
            "Được khởi nguồn từ tình yêu với nghệ thuật hoa, chúng tôi biến những cành hoa quen thuộc thành trải nghiệm đầy cảm xúc cho cưới hỏi, lễ kỷ niệm và những khoảnh khắc biết ơn đời thường.",
          heroImageAlt: "Bó hoa chủ đạo Floral Boutique",
          sustainabilityTitle:
            "Tận tâm với phát triển bền vững và sức mạnh cảm xúc sâu sắc của thế giới thực vật.",
          sustainabilityDescription:
            "Chúng tôi chọn hoa tươi từ những nông trại đáng tin cậy, giảm lãng phí trong từng công đoạn và tạo tác mỗi thiết kế bằng sự chủ đích để mỗi lần giao hoa đều thật riêng tư.",
          craftedCollectionAlt: "Bộ sưu tập hoa thủ công",
          atelierWorkflowAlt: "Quy trình tại xưởng hoa",
          atelierTitle: "Xưởng hoa",
          atelierDescription:
            "Mỗi bó hoa đều được nghệ nhân thực hiện thủ công trong không gian yên tĩnh, nơi sự cân bằng, màu sắc và câu chuyện luôn được đặt lên hàng đầu.",
          founderAlt: "Chân dung nhà sáng lập",
          founderRole: "Nhà sáng lập & Giám đốc sáng tạo",
          founderQuote:
            "Hoa giúp tôi hiểu rằng cái đẹp có thể xoa dịu con người. Floral Boutique được tạo nên từ niềm tin đó: thiết kế không chỉ để trang trí mà còn để chạm đến cảm xúc.",
          founderDescription:
            "Chúng tôi tiếp tục hòa quyện phong cách hoa hiện đại với lối kể chuyện giàu ý nghĩa, để mỗi thiết kế luôn sống động và tinh tế.",
          exploreCollection: "Khám phá bộ sưu tập",
          earthKindTitle: "Nghệ thuật thân thiện với Trái Đất",
          earthKindDescription:
            "Chúng tôi tin rằng thiết kế hoa nên để lại vẻ đẹp chứ không phải rác thải. Hoạt động mỗi ngày của chúng tôi tuân theo các chuẩn mực bền vững:",
          bulletOne: "Chọn nguồn hoa theo mùa từ nông trại địa phương",
          bulletTwo: "Bao bì tái sử dụng và vật liệu bọc thân thiện ủ hữu cơ",
          bulletThree: "Hợp tác công bằng với nông hộ và nghệ nhân",
          bulletFour: "Ưu tiên chất lượng trong từng bó hoa",
          seasonalAlt: "Thiết kế hoa theo mùa",
          sympathyAlt: "Thiết kế hoa sẻ chia",
          floralPurposeTitle: "Sứ mệnh của hoa",
          floralPurposeDescription:
            "Từ quà tặng thường nhật đến những cột mốc đáng nhớ, các thiết kế của chúng tôi được tạo ra để làm ký ức trở nên rõ nét và giàu cảm xúc hơn.",
        }
      : {
          journeyBadge: "Our Journey",
          heroTitle: "Our Story:\nArtistry in\nEvery Petal",
          heroDescription:
            "Founded with a love for floral craftsmanship, we transform everyday stems into heartfelt experiences for weddings, celebrations, and quiet moments of gratitude.",
          heroImageAlt: "Floral Boutique hero bouquet",
          sustainabilityTitle:
            "Dedicated to sustainability and the profound emotional power of the botanical world.",
          sustainabilityDescription:
            "We source fresh flowers from trusted farms, minimize waste in every process, and craft each arrangement with intention so every delivery feels personal.",
          craftedCollectionAlt: "Crafted floral collection",
          atelierWorkflowAlt: "Atelier workflow",
          atelierTitle: "The Atelier",
          atelierDescription:
            "Every bouquet is handcrafted by our floral artists in a calm studio environment where balance, color, and storytelling come first.",
          founderAlt: "Founder portrait",
          founderRole: "Founder & Creative Lead",
          founderQuote:
            "Flowers helped me understand how beauty can comfort people. Floral Boutique was born from that belief: design should touch emotions, not just decorate spaces.",
          founderDescription:
            "We continue to blend modern floral styling with meaningful storytelling, making every arrangement feel thoughtful and alive.",
          exploreCollection: "Explore Collection",
          earthKindTitle: "Earth-Kind Artistry",
          earthKindDescription:
            "We believe floral design should leave beauty behind, not waste. Our daily operations follow mindful standards:",
          bulletOne: "Seasonal sourcing from local farms",
          bulletTwo: "Reusable packaging and compost-friendly wraps",
          bulletThree: "Fair partnership with growers and artisans",
          bulletFour: "Quality-first curation in every bouquet",
          seasonalAlt: "Seasonal arrangement",
          sympathyAlt: "Sympathy arrangement",
          floralPurposeTitle: "Floral Purpose",
          floralPurposeDescription:
            "From gift moments to milestone ceremonies, our arrangements are crafted to make every memory more vivid and heartfelt.",
        };

  const heroTitleLines = copy.heroTitle.split("\n");

  return (
    <div className="min-h-screen bg-[#f7f3ed]">
      <Navbar />

      <main>
        <section className="px-4 pb-18 pt-16 md:px-8 lg:px-12">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_460px]">
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[2.2px] text-[#b39a7b]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {copy.journeyBadge}
                </p>
                <h1
                  className="mt-4 max-w-[560px] text-[46px] leading-[0.96] text-[#2d2a26] md:text-[56px] lg:text-[64px]"
                  style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                  {heroTitleLines.map((line, index) => (
                    <span key={`${line}-${index}`}>
                      {line}
                      {index < heroTitleLines.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </h1>
                <p className="mt-5 max-w-[520px] text-[15px] leading-7 text-[#6b6259]">
                  {copy.heroDescription}
                </p>
              </div>

              <div className="relative mx-auto h-[360px] w-[360px] rounded-full bg-[#ebe6df] md:h-[420px] md:w-[420px]">
                <Image
                  src={HERO_IMAGE}
                  alt={copy.heroImageAlt}
                  fill
                  sizes="420px"
                  className="rounded-full object-cover p-4"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f1ede7] px-4 py-16 md:px-8">
          <div className="mx-auto max-w-[980px] text-center">
            <p
              className="mx-auto max-w-[760px] text-[34px] leading-[1.18] text-[#2d2a26]"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              {copy.sustainabilityTitle}
            </p>
            <p className="mx-auto mt-5 max-w-[700px] text-[14px] leading-7 text-[#7b7168]">
              {copy.sustainabilityDescription}
            </p>
          </div>
        </section>

        <section className="px-4 py-18 md:px-8">
          <div className="mx-auto grid max-w-[1200px] gap-6 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="relative min-h-[330px] overflow-hidden rounded-[28px]">
              <Image
                src={STORY_IMAGE_LEFT}
                alt={copy.craftedCollectionAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
            </div>

            <div className="grid gap-6">
              <div className="relative min-h-[165px] overflow-hidden rounded-[28px]">
                <Image
                  src={STORY_IMAGE_RIGHT}
                  alt={copy.atelierWorkflowAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 34vw"
                  className="object-cover"
                />
              </div>
              <article className="rounded-[28px] border border-[#e3d9cd] bg-white/80 p-6">
                <p
                  className="text-[20px] text-[#2d2a26]"
                  style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                  {copy.atelierTitle}
                </p>
                <p className="mt-3 text-[13px] leading-6 text-[#70665d]">
                  {copy.atelierDescription}
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="px-4 pb-18 md:px-8">
          <div className="mx-auto grid max-w-[1200px] items-center gap-8 rounded-[30px] border border-[#e8ddd1] bg-white/70 p-6 md:p-10 lg:grid-cols-[270px_minmax(0,1fr)]">
            <div className="relative h-[320px] overflow-hidden rounded-[130px_130px_18px_18px] bg-[#ebe5dd]">
              <Image
                src={FOUNDER_IMAGE}
                alt={copy.founderAlt}
                fill
                sizes="270px"
                className="object-cover"
              />
            </div>

            <div>
              <p
                className="text-[36px] leading-none text-[#2d2a26]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                Minh Quân
              </p>
              <p className="mt-3 text-[14px] text-[#8d7f72]">{copy.founderRole}</p>
              <p className="mt-4 max-w-[640px] text-[14px] leading-7 text-[#6f645b]">
                &quot;{copy.founderQuote}&quot;
              </p>
              <p className="mt-3 max-w-[640px] text-[14px] leading-7 text-[#6f645b]">
                {copy.founderDescription}
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center rounded-full bg-[#8d6030] px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#744c22]"
              >
                {copy.exploreCollection}
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[#f1ede7] px-4 py-18 md:px-8">
          <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[1fr_360px]">
            <article className="rounded-[28px] border border-[#e6dccf] bg-white/75 p-7">
              <p
                className="text-[26px] text-[#2d2a26]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                {copy.earthKindTitle}
              </p>
              <p className="mt-3 text-[14px] leading-7 text-[#6f655d]">
                {copy.earthKindDescription}
              </p>
              <ul className="mt-5 space-y-3 text-[14px] text-[#5f554b]">
                <li className="flex items-center gap-3">
                  <Leaf className="h-4 w-4 text-[#7f9b71]" />
                  {copy.bulletOne}
                </li>
                <li className="flex items-center gap-3">
                  <Recycle className="h-4 w-4 text-[#7f9b71]" />
                  {copy.bulletTwo}
                </li>
                <li className="flex items-center gap-3">
                  <HeartHandshake className="h-4 w-4 text-[#7f9b71]" />
                  {copy.bulletThree}
                </li>
                <li className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-[#7f9b71]" />
                  {copy.bulletFour}
                </li>
              </ul>
            </article>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative min-h-[160px] overflow-hidden rounded-[22px]">
                <Image
                  src={VALUE_IMAGE_1}
                  alt={copy.seasonalAlt}
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              </div>
              <div className="relative min-h-[160px] overflow-hidden rounded-[22px]">
                <Image
                  src={VALUE_IMAGE_2}
                  alt={copy.sympathyAlt}
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              </div>
              <div className="col-span-2 rounded-[22px] bg-[#e2d8cd] p-6">
                <Flower2 className="h-6 w-6 text-[#8d6030]" />
                <p
                  className="mt-3 text-[21px] text-[#2d2a26]"
                  style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                  {copy.floralPurposeTitle}
                </p>
                <p className="mt-2 text-[13px] leading-6 text-[#6d6258]">
                  {copy.floralPurposeDescription}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
