import Image from "next/image";

const IMG_BIRTHDAY = "/images/birthday.png";
const IMG_ANNIVERSARY = "/images/anniversary.png";
const IMG_SYMPATHY = "/images/sympathy.png";

const occasions = [
  { label: "Birthday", img: IMG_BIRTHDAY },
  { label: "Anniversary", img: IMG_ANNIVERSARY },
  { label: "Sympathy", img: IMG_SYMPATHY },
];

export function ShopSection() {
  return (
    <section className="bg-[#f7f3ed] py-24">
      <div className="max-w-[1280px] mx-auto px-[160px]">
        <div className="text-center mb-16">
          <p
            className="text-[#d0bb95] text-[16px] font-bold tracking-[2px] uppercase mb-[10px]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            CHOOSE YOUR MOMENT
          </p>
          <h2
            className="text-[#2d2a26] text-[48px] font-light leading-[48px]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            Shop by Occasion
          </h2>
        </div>
        <div className="flex items-center justify-center gap-[86px]">
          {occasions.map((o) => (
            <button
              key={o.label}
              className="flex flex-col items-center gap-6 group cursor-pointer"
            >
              <div className="w-[277px] h-[282px] rounded-full border-[8px] border-[#c2a571] overflow-hidden relative transition-transform group-hover:scale-105 duration-300">
                <Image
                  src={o.img}
                  alt={o.label}
                  fill
                  sizes="277px"
                  className="object-cover"
                />
              </div>
              <span
                className="text-[#2d2a26] text-[24px] font-normal leading-[32px] tracking-[-0.6px]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                {o.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
