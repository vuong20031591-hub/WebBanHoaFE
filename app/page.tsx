import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  User,
  Search,
  Flower2,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Facebook,
  MessageCircle,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Asset URLs từ Figma MCP
───────────────────────────────────────────── */
const IMG_HERO =
  "https://www.figma.com/api/mcp/asset/cd71dc72-fa5b-4b1e-9c27-87f01296972f";
const IMG_BIRTHDAY =
  "https://www.figma.com/api/mcp/asset/094b1528-019f-4c4f-8c6e-6f839aceee3c";
const IMG_ANNIVERSARY =
  "https://www.figma.com/api/mcp/asset/67ff151b-4af0-424f-b6d5-1f029613fafb";
const IMG_SYMPATHY =
  "https://www.figma.com/api/mcp/asset/eeb1cd6e-f6a9-4309-a3d8-abb3feac0748";
const IMG_PROCESS_2 =
  "https://www.figma.com/api/mcp/asset/20e183e3-91b7-4a4f-a5de-4c61cc73f9d3";
const IMG_PROCESS_3 =
  "https://www.figma.com/api/mcp/asset/4763f8bd-522b-4fb2-a1e6-e6c63296d234";
const IMG_HERITAGE =
  "https://www.figma.com/api/mcp/asset/ff162c14-4a53-48aa-b09d-5c32c9d1562c";
const IMG_GALLERY_3 =
  "https://www.figma.com/api/mcp/asset/9f7584a2-b5df-41ad-8a18-6f56cbcb89ff";

/* ─────────────────────────────────────────────
   Navbar
───────────────────────────────────────────── */
function Navbar() {
  return (
    <nav className="bg-[#fcfaf7] border-b border-[#eee4e1] sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-10 h-[81px] flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-1.5">
            <Flower2 className="text-[#d0bb95] w-6 h-6" />
            <span
              className="text-[#2d2a26] text-[20px] font-medium tracking-[-0.5px]"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              Floral Boutique
            </span>
          </Link>
          <div className="flex items-center gap-9">
            {[
              { label: "Shop All",  href: "/products" },
              { label: "Weddings",  href: "/products?style=Classic+Luxe" },
              { label: "Occasions", href: "/products?occasion=Birthday" },
              { label: "Our Story", href: "#our-heritage" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[#2d2a26] text-[14px] font-medium tracking-[0.35px] hover:text-[#d0bb95] transition-colors"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="bg-[#f1eeea] rounded-full h-8 px-4 flex items-center w-[232px]">
            <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
            <span
              className="text-gray-400 text-[12px] font-light"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Search arrangements...
            </span>
          </div>
          <Link
            href="/products"
            className="w-10 h-10 flex items-center justify-center hover:bg-[#f1eeea] rounded-full transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-[#2d2a26]" />
          </Link>
          <button className="w-9 h-9 flex items-center justify-center hover:bg-[#f1eeea] rounded-full transition-colors">
            <User className="w-5 h-5 text-[#2d2a26]" />
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────
   Hero Section
───────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="bg-[#fcfaf7] h-[calc(100vh-81px)] flex items-center overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-[160px] w-full">
        <div className="flex items-center gap-16">
          {/* Text side */}
          <div className="flex flex-col gap-10 w-[448px] shrink-0">
            <div className="flex flex-col gap-6">
              <p
                className="text-[#d0bb95] text-[11px] font-bold tracking-[3.3px] uppercase"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                LUXURY COLLECTION 2024
              </p>
              <h1
                className="text-[#2d2a26] text-[clamp(56px,6vw,96px)] font-light leading-[1.05] tracking-[-2.4px]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                Artistry in Every Petal
              </h1>
              <p
                className="text-[#5c6b5e] text-[20px] font-light leading-[28px]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Experience the elegance of premium floral arrangements,
                hand-crafted for life&apos;s most beautiful moments.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <button
                className="bg-[#d0bb95] border border-[rgba(208,187,149,0.4)] text-white text-[14px] font-medium px-10 py-4 rounded-3xl hover:bg-[#c2a571] transition-colors"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Shop Collection
              </button>
              <button
                className="bg-white border border-[rgba(208,187,149,0.4)] text-[#2d2a26] text-[14px] font-medium px-10 py-4 rounded-3xl hover:bg-[#fcfaf7] transition-colors"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                View Lookbook
              </button>
            </div>
          </div>

          {/* Image side */}
          <div className="relative w-[448px] shrink-0" style={{ height: "min(560px, calc(100vh - 200px))" }}>
            {/* Decorative shapes */}
            <div className="absolute w-[224px] h-[224px] bg-[rgba(208,187,149,0.2)] rounded-tl-[200px] rounded-tr-[200px] rounded-bl-[20px] rounded-br-[20px] left-[-64px] top-[378px] pointer-events-none" />
            <div className="absolute w-[149px] h-[149px] bg-[rgba(208,187,149,0.3)] rounded-tl-[200px] rounded-tr-[200px] rounded-bl-[20px] rounded-br-[20px] right-[-32px] top-[-32px] border border-[rgba(208,187,149,0.2)] pointer-events-none" />
            {/* Main image */}
            <div className="relative w-full h-full rounded-tl-[200px] rounded-tr-[200px] rounded-bl-[20px] rounded-br-[20px] overflow-hidden shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)]">
              <Image
                src={IMG_HERO}
                alt="Premium floral arrangement"
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

/* ─────────────────────────────────────────────
   Shop by Occasion
───────────────────────────────────────────── */
const occasions = [
  { label: "Birthday", img: IMG_BIRTHDAY },
  { label: "Anniversary", img: IMG_ANNIVERSARY },
  { label: "Sympathy", img: IMG_SYMPATHY },
];

function ShopSection() {
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

/* ─────────────────────────────────────────────
   Our Process
───────────────────────────────────────────── */
const steps = [
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
];

function ProcessSection() {
  return (
    <section className="bg-[#fef5f6] py-24 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-[160px]">
        <div className="text-center mb-24">
          <p
            className="text-[#d0bb95] text-[16px] font-bold tracking-[2px] uppercase mb-[10px]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            OUR PROCESS
          </p>
          <h2
            className="text-[#2d2a26] text-[48px] font-light leading-[48px]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            The Art of Gifting
          </h2>
        </div>

        <div className="flex flex-col gap-24">
          {steps.map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-32 ${s.reverse ? "flex-row-reverse" : ""}`}
            >
              {/* Image block */}
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
              {/* Text */}
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

/* ─────────────────────────────────────────────
   Heritage Section
───────────────────────────────────────────── */
function HeritageSection() {
  return (
    <section className="bg-[#fcfaf7] py-32">
      <div className="max-w-[1280px] mx-auto px-[160px]">
        <div className="flex items-start gap-24">
          {/* Left: image + quote */}
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
            {/* Quote card */}
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

          {/* Right: text */}
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

/* ─────────────────────────────────────────────
   Gallery
───────────────────────────────────────────── */
const gallery = [
  { src: IMG_BIRTHDAY, alt: "Birthday arrangement" },
  { src: IMG_HERO, alt: "Hero arrangement" },
  { src: IMG_GALLERY_3, alt: "Gallery arrangement" },
  { src: IMG_HERITAGE, alt: "Heritage arrangement" },
];

function GallerySection() {
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

/* ─────────────────────────────────────────────
   Contact / Subscribe
───────────────────────────────────────────── */
function ContactSection() {
  return (
    <section className="bg-[rgba(245,213,217,0.2)] py-24">
      <div className="max-w-[1280px] mx-auto px-[192px]">
        <div className="flex items-center justify-between">
          <div className="w-[349px]">
            <h2
              className="text-[#2d2a26] text-[36px] font-light leading-[40px] mb-4"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              Join Our Bloom Club
            </h2>
            <p
              className="text-[#5c6b5e] text-[18px] font-light leading-[28px]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Receive styling tips, seasonal updates, and 10% off your first order.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-[320px] h-16 bg-white rounded-3xl border border-[#ece4da] px-4 flex items-center">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-transparent text-[14px] font-light text-[#2d2a26] placeholder-gray-400 outline-none"
                style={{ fontFamily: "var(--font-inter)" }}
              />
            </div>
            <button
              className="bg-[#d0bb95] border border-[rgba(0,0,0,0.1)] text-white text-[16px] font-medium px-8 h-16 rounded-3xl hover:bg-[#c2a571] transition-colors whitespace-nowrap"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Footer
───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-white border-t border-[#eee4e1]">
      <div className="max-w-[1280px] mx-auto px-[160px] pt-20 pb-6">
        <div className="flex gap-16 mb-16">
          {/* Brand */}
          <div className="w-[192px] flex flex-col gap-8 shrink-0">
            <div className="flex items-center gap-3 h-14">
              <Flower2 className="text-[#d0bb95] w-6 h-6 shrink-0" />
              <span
                className="text-[#2d2a26] text-[20px] font-medium"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                Floral Boutique
              </span>
            </div>
            <p
              className="text-[#5c6b5e] text-[14px] font-light leading-[22.75px]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Redefining the floral experience with curated aesthetics and
              sustainable practices. Hand-crafted in our local studio.
            </p>
            <div className="flex gap-5">
              <button className="w-11 h-11 bg-[#f7f3ed] rounded-full flex items-center justify-center shadow-sm hover:bg-[#ece4da] transition-colors">
                <Facebook className="w-5 h-5 text-[#5c6b5e]" />
              </button>
            </div>
          </div>

          {/* Shop */}
          <div className="flex flex-col gap-6 w-[192px]">
            <p
              className="text-[#d0bb95] text-[10px] font-bold tracking-[2px] uppercase"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              SHOP
            </p>
            <div className="flex flex-col gap-4">
              {["All Flowers", "Best Sellers", "Subscriptions", "Gifts"].map((t) => (
                <Link
                  key={t}
                  href="#"
                  className="text-[#5c6b5e] text-[14px] font-light hover:text-[#2d2a26] transition-colors"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="flex flex-col gap-6 w-[192px]">
            <p
              className="text-[#d0bb95] text-[10px] font-bold tracking-[2px] uppercase"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              SERVICES
            </p>
            <div className="flex flex-col gap-4">
              {["Weddings", "Events", "Corporate", "Custom Designs"].map((t) => (
                <Link
                  key={t}
                  href="#"
                  className="text-[#5c6b5e] text-[14px] font-light hover:text-[#2d2a26] transition-colors"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-6 w-[203px]">
            <p
              className="text-[#d0bb95] text-[10px] font-bold tracking-[2px] uppercase"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              CONTACT
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#5c6b5e] shrink-0" />
                <span
                  className="text-[#5c6b5e] text-[14px] font-light"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  hello@floralboutique.com
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#5c6b5e] shrink-0" />
                <span
                  className="text-[#5c6b5e] text-[14px] font-light"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  123 Bloom Street, NY
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#5c6b5e] shrink-0" />
                <span
                  className="text-[#5c6b5e] text-[14px] font-light"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  +1 (555) 000-1111
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#eee4e1] pt-6 flex items-center justify-between">
          <p
            className="text-[rgba(92,107,94,0.7)] text-[11px] font-light tracking-[0.275px]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            © 2026 Floral Boutique. All rights reserved.
          </p>
          <div className="flex gap-10">
            {["Privacy Policy", "Terms of Service", "Shipping Info"].map((t) => (
              <Link
                key={t}
                href="#"
                className="text-[rgba(92,107,94,0.7)] text-[11px] font-light tracking-[0.275px] hover:text-[#5c6b5e] transition-colors"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   Chat Live
───────────────────────────────────────────── */
function ChatLive() {
  return (
    <button className="fixed bottom-8 right-8 w-14 h-14 bg-[#f8e1da] rounded-full shadow-[0px_4px_20px_0px_rgba(138,109,93,0.1)] flex items-center justify-center hover:bg-[#f0cfc4] transition-colors z-50">
      <MessageCircle className="w-6 h-6 text-[#c2a571]" />
    </button>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <ShopSection />
        <ProcessSection />
        <HeritageSection />
        <GallerySection />
        <ContactSection />
      </main>
      <Footer />
      <ChatLive />
    </div>
  );
}
