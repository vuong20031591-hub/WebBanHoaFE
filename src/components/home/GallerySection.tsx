import Image from "next/image";

const IMG_BIRTHDAY = "/images/birthday.png";
const IMG_HERO = "/images/hero-main.png";
const IMG_GALLERY_3 = "/images/gallery-photo.png";
const IMG_HERITAGE = "/images/heritage-main.png";

const gallery = [
  { src: IMG_BIRTHDAY, alt: "Birthday arrangement" },
  { src: IMG_HERO, alt: "Hero arrangement" },
  { src: IMG_GALLERY_3, alt: "Gallery arrangement" },
  { src: IMG_HERITAGE, alt: "Heritage arrangement" },
];

export function GallerySection() {
  return (
    <section className="bg-[#f7f3ed] py-24">
      <div className="max-w-[1280px] mx-auto px-[160px]">
        <div className="text-center mb-16">
          <p
            className="text-[#d0bb95] text-[10px] font-bold tracking-[2px] uppercase mb-[10px]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            @FLORALBOUTIQUE
          </p>
          <h2
            className="text-[#2d2a26] text-[36px] font-light leading-[40px]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            Living with Blooms
          </h2>
        </div>
        <div className="flex gap-6">
          {gallery.map((g, i) => (
            <div
              key={i}
              className="relative w-[222px] h-[222px] rounded-2xl overflow-hidden shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] cursor-pointer hover:scale-105 transition-transform duration-300 shrink-0"
            >
              <Image src={g.src} alt={g.alt} fill sizes="222px" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
