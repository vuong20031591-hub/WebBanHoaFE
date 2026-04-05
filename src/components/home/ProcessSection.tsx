"use client";

import Image from "next/image";
import { useLocale } from "@/src/contexts";

const IMG_BIRTHDAY = "/images/birthday.png";
const IMG_PROCESS_2 = "/images/process-step-2.png";
const IMG_PROCESS_3 = "/images/process-step-3.png";

export function ProcessSection() {
  const { locale } = useLocale();
  const copy =
    locale === "vi"
      ? {
          badge: "QUY TRÌNH CỦA CHÚNG TÔI",
          title: "Nghệ thuật gửi trao",
          steps: [
            {
              num: "01",
              title: "Tuyển chọn",
              desc: "Mỗi bông hoa được chọn thủ công từ nông trại bền vững để đảm bảo độ tươi và cá tính riêng.",
              img: IMG_BIRTHDAY,
              reverse: false,
            },
            {
              num: "02",
              title: "Chạm khắc cá nhân",
              desc: "Nghệ nhân phối hoa theo cảm xúc, thêm thiệp tay và bao gói riêng để món quà trở nên gần gũi hơn.",
              img: IMG_PROCESS_2,
              reverse: true,
            },
            {
              num: "03",
              title: "Trao tận tay",
              desc: "Đơn hoa được giao tay trong xe chuyên dụng kiểm soát nhiệt độ để từng cánh hoa luôn nở rạng rỡ.",
              img: IMG_PROCESS_3,
              reverse: false,
            },
          ],
        }
      : {
          badge: "OUR PROCESS",
          title: "The Art of Gifting",
          steps: [
            {
              num: "01",
              title: "The Selection",
              desc: "Hand-picked from sustainable farms, each stem is selected for its peak freshness and unique character.",
              img: IMG_BIRTHDAY,
              reverse: false,
            },
            {
              num: "02",
              title: "The Personal Touch",
              desc: "Our artisans compose your arrangement, adding handwritten notes and bespoke packaging for an intimate touch.",
              img: IMG_PROCESS_2,
              reverse: true,
            },
            {
              num: "03",
              title: "The Arrival",
              desc: "Delivered by hand in our specialized climate-controlled boutique vans to ensure every petal arrives in perfect bloom.",
              img: IMG_PROCESS_3,
              reverse: false,
            },
          ],
        };

  return (
    <section className="bg-[#fef5f6] py-24 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-[160px]">
        <div className="text-center mb-24">
          <p
            className="text-[#d0bb95] text-[16px] font-bold tracking-[2px] uppercase mb-[10px]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {copy.badge}
          </p>
          <h2
            className="text-[#2d2a26] text-[48px] font-light leading-[48px]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            {copy.title}
          </h2>
        </div>

        <div className="flex flex-col gap-24">
          {copy.steps.map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-32 ${s.reverse ? "flex-row-reverse" : ""}`}
            >
              <div className="relative w-[478px] h-[320px] shrink-0">
                <span
                  className="absolute text-[#d0bb95] text-[150px] font-light leading-none select-none"
                  style={{
                    fontFamily: "var(--font-noto-serif)",
                    top: "-65px",
                    left: s.reverse ? "auto" : "0",
                    right: s.reverse ? "0" : "auto",
                  }}
                >
                  {s.num}
                </span>
                <div
                  className="absolute w-[277px] h-[288px] rounded-tl-[60px] rounded-tr-[40px] rounded-bl-[70px] rounded-br-[30px] overflow-hidden shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1)]"
                  style={{
                    top: 0,
                    left: s.reverse ? 0 : "201px",
                  }}
                >
                  <Image
                    src={s.img}
                    alt={s.title}
                    fill
                    sizes="277px"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="w-[416px]">
                <h3
                  className="text-[#2d2a26] text-[30px] font-normal leading-[36px] mb-4"
                  style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                  {s.title}
                </h3>
                <p
                  className="text-[#5c6b5e] text-[18px] font-light leading-[29.25px]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
