"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  Flower2,
  ShoppingCart,
  User,
  Search,
  Mail,
  Phone,
  MapPin,
  Facebook,
  MessageCircle,
  Truck,
  Leaf,
  ShieldCheck,
  CalendarDays,
  X,
  PackageSearch,
} from "lucide-react";
import { MOCK_PRODUCTS, type Product } from "@/lib/mockData";

/* ─────────────────────────────────────────────
   Thumbnail fallbacks từ Figma MCP
───────────────────────────────────────────── */
const IMG_THUMB_1 = "https://www.figma.com/api/mcp/asset/2163feca-70ec-4042-b264-331dbe615214";
const IMG_THUMB_2 = "https://www.figma.com/api/mcp/asset/d3ace9e8-d466-4528-adae-69e5ab6bc136";
const IMG_THUMB_3 = "https://www.figma.com/api/mcp/asset/f85b6df9-8922-4c4d-8e43-aa5a591e0fb4";
const IMG_THUMB_4 = "https://www.figma.com/api/mcp/asset/1bd4166c-001e-40eb-baac-26f50e136e74";

/* ─────────────────────────────────────────────
   Ribbon colors
───────────────────────────────────────────── */
const RIBBONS = [
  { label: "Red",      bg: "#e8305e" },
  { label: "Silver",   bg: "linear-gradient(to bottom, #f5f5dc, #8f8f80)" },
  { label: "Rose Gold",bg: "#bc8f8f" },
  { label: "Gold",     bg: "#d4af37" },
];

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
              { label: "Weddings",  href: "/products?categoryId=2" },
              { label: "Occasions", href: "/products?categoryId=3" },
              { label: "Our Story", href: "/#our-heritage" },
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
   Footer
───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-white border-t border-[#eee4e1]">
      <div className="max-w-[1280px] mx-auto px-[160px] pt-20 pb-6">
        <div className="flex gap-16 mb-16">
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
            <button className="w-11 h-11 bg-[#f7f3ed] rounded-full flex items-center justify-center shadow-sm hover:bg-[#ece4da] transition-colors">
              <Facebook className="w-5 h-5 text-[#5c6b5e]" />
            </button>
          </div>
          {[
            { title: "SHOP",     links: ["All Flowers", "Best Sellers", "Subscriptions", "Gifts"] },
            { title: "SERVICES", links: ["Weddings", "Events", "Corporate", "Custom Designs"] },
          ].map((col) => (
            <div key={col.title} className="flex flex-col gap-6 w-[192px]">
              <p
                className="text-[#d0bb95] text-[10px] font-bold tracking-[2px] uppercase"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                {col.title}
              </p>
              <div className="flex flex-col gap-4">
                {col.links.map((t) => (
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
          ))}
          <div className="flex flex-col gap-6 w-[203px]">
            <p
              className="text-[#d0bb95] text-[10px] font-bold tracking-[2px] uppercase"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              CONTACT
            </p>
            <div className="flex flex-col gap-4">
              {[
                { Icon: Mail,   text: "hello@floralboutique.com" },
                { Icon: MapPin, text: "123 Bloom Street, NY" },
                { Icon: Phone,  text: "+1 (555) 000-1111" },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[#5c6b5e] shrink-0" />
                  <span
                    className="text-[#5c6b5e] text-[14px] font-light"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
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
   Related Product Card
───────────────────────────────────────────── */
function RelatedProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="flex flex-col gap-6 group">
      <div className="bg-[rgba(255,255,255,0.4)] rounded-tl-[1000px] rounded-tr-[1000px] overflow-hidden relative w-full aspect-[3/4] shrink-0">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 1280px) 25vw, 280px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="flex flex-col gap-1 items-center w-full">
        <p
          className="text-[#2d2a26] text-[20px] font-light leading-[28px] text-center"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          {product.name}
        </p>
        <p
          className="text-[#9a8c81] text-[11px] font-medium tracking-[1.1px] uppercase text-center"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   Product Detail Content
───────────────────────────────────────────── */
function ProductDetailContent() {
  const params = useParams();
  const id = Number(params?.id);

  /* Tìm sản phẩm từ mock data */
  const product = MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
  const related = MOCK_PRODUCTS.filter((p) => p.id !== id).slice(0, 4);

  /* Gallery: main image + thumbnail fallbacks */
  const images = product
    ? [product.image, IMG_THUMB_1, IMG_THUMB_2, IMG_THUMB_3]
    : [IMG_THUMB_1, IMG_THUMB_2, IMG_THUMB_3, IMG_THUMB_4];

  /* UI state */
  const [activeImg, setActiveImg]           = useState(0);
  const [selectedSize, setSelectedSize]     = useState<"classic" | "deluxe" | "grand">("deluxe");
  const [selectedRibbon, setSelectedRibbon] = useState(0);
  const [deliveryDate, setDeliveryDate]     = useState("");
  const [giftNote, setGiftNote]             = useState("");

  /* ── Not found ── */
  if (!product) {
    return (
      <div className="bg-[#f9f7f2] min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <PackageSearch className="w-12 h-12 text-[#d0bb95]" />
          <p className="text-[#5c6b5e] text-[18px] font-light" style={{ fontFamily: "var(--font-noto-serif)" }}>
            Không tìm thấy sản phẩm
          </p>
          <Link
            href="/products"
            className="mt-4 px-8 py-3 bg-[#d0bb95] text-white text-[14px] rounded-full hover:bg-[#c2a571] transition-colors"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Quay lại Shop
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#f9f7f2] min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-[80px] py-12">

          {/* ── Breadcrumb ── */}
          <div className="flex items-center gap-4 mb-12">
            <Link
              href="/"
              className="text-[#9a8c81] text-[11px] tracking-[1.65px] uppercase hover:text-[#2d2a26] transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Home
            </Link>
            <span className="text-[#9a8c81] text-[11px]">/</span>
            <Link
              href="/products"
              className="text-[#9a8c81] text-[11px] tracking-[1.65px] uppercase hover:text-[#2d2a26] transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Shop
            </Link>
            <span className="text-[#9a8c81] text-[11px]">/</span>
            <span
              className="text-[#2d2a26] text-[11px] tracking-[1.65px] uppercase"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {product.name}
            </span>
          </div>

          {/* ── Product Section ── */}
          <div className="flex gap-[128px] items-start pb-[112px]">

            {/* Left: Gallery */}
            <div className="flex-1 flex flex-col gap-8 min-w-0">
              {/* Main Image */}
              <div className="bg-[#f3f4f6] border border-[rgba(255,255,255,0.5)] rounded-tl-[1000px] rounded-tr-[1000px] overflow-hidden relative w-full shadow-sm">
                <div className="relative w-full" style={{ paddingBottom: "115%" }}>
                  <Image
                    src={images[activeImg]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1280px) 45vw, 520px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-4">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative rounded-tl-[1000px] rounded-tr-[1000px] overflow-hidden border-2 transition-all ${
                      activeImg === i
                        ? "border-[#2d2a26]"
                        : "border-[rgba(255,255,255,0.4)] hover:border-[rgba(45,42,38,0.3)]"
                    }`}
                    style={{ paddingBottom: "100%" }}
                  >
                    <Image
                      src={src}
                      alt={`View ${i + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="flex-1 flex flex-col min-w-0 py-4">

              {/* Title */}
              <div className="pb-6">
                <h1
                  className="text-[#2d2a26] text-[60px] font-light leading-[60px]"
                  style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                  {product.name}
                </h1>
              </div>

              {/* Price */}
              <div className="pb-8 flex items-baseline gap-4">
                <span
                  className="text-[#2d2a26] text-[24px] font-light tracking-[-0.6px]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  ${product.price.toFixed(2)}
                </span>
                <span
                  className="text-[#9a8c81] text-[10px] tracking-[1px] uppercase"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  Inclusive of tax
                </span>
              </div>

              {/* Description */}
              <div className="pb-12 max-w-[448px]">
                <p
                  className="text-[rgba(45,42,38,0.7)] text-[16px] font-light leading-[26px]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {product.description}
                </p>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-12">

                {/* Size Selection */}
                <div className="flex flex-col gap-4">
                  <p
                    className="text-[rgba(45,42,38,0.4)] text-[10px] font-semibold tracking-[2px] uppercase"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Select Arrangement Size
                  </p>
                  <div className="flex gap-3">
                    {(["classic", "deluxe", "grand"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-8 py-3 rounded-full text-[11px] tracking-[1.1px] uppercase border transition-colors ${
                          selectedSize === size
                            ? "bg-[#2d2a26] border-[#2d2a26] text-white"
                            : "border-[rgba(45,42,38,0.1)] text-[#2d2a26] hover:border-[rgba(45,42,38,0.4)]"
                        }`}
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ribbon Selection */}
                <div className="flex flex-col gap-4">
                  <p
                    className="text-[rgba(45,42,38,0.4)] text-[10px] font-semibold tracking-[2px] uppercase"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Ribbon Selection
                  </p>
                  <div className="flex gap-4">
                    {RIBBONS.map((ribbon, i) => (
                      <button
                        key={ribbon.label}
                        title={ribbon.label}
                        onClick={() => setSelectedRibbon(i)}
                        className="relative w-8 h-8 rounded-full shrink-0 transition-transform hover:scale-110"
                        style={{ background: ribbon.bg }}
                      >
                        {selectedRibbon === i && (
                          <span className="absolute inset-0 rounded-full shadow-[0_0_0_2px_white,0_0_0_3px_#2d2a26]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Date */}
                <div className="flex flex-col gap-3">
                  <p
                    className="text-[rgba(45,42,38,0.4)] text-[10px] font-semibold tracking-[2px] uppercase"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Delivery Date
                  </p>
                  <div className="relative w-[256px] border-b border-[rgba(45,42,38,0.2)] pb-2">
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full bg-transparent text-[#2d2a26] text-[14px] outline-none cursor-pointer appearance-none pr-6"
                      style={{ fontFamily: "var(--font-inter)" }}
                    />
                    <CalendarDays className="absolute right-0 top-0 w-4.5 h-4.5 text-[#9a8c81] pointer-events-none" />
                  </div>
                </div>

                {/* Gift Note */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-end justify-between">
                    <p
                      className="text-[rgba(45,42,38,0.4)] text-[10px] font-semibold tracking-[2px] uppercase"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      Gift Note
                    </p>
                    <p
                      className="text-[#9a8c81] text-[9px] tracking-[0.9px] uppercase"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      Artisan Card
                    </p>
                  </div>
                  <div className="relative">
                    <div className="relative -rotate-1 bg-[rgba(252,250,247,0.8)] border border-[rgba(45,42,38,0.07)] rounded-sm shadow-sm overflow-hidden">
                      <div className="rotate-1">
                        <textarea
                          value={giftNote}
                          onChange={(e) => setGiftNote(e.target.value.slice(0, 250))}
                          placeholder="Type your heartfelt message here..."
                          rows={5}
                          className="w-full bg-transparent px-8 py-8 text-[20px] text-[#2d2a26] outline-none resize-none placeholder-[rgba(0,0,0,0.3)]"
                          style={{ fontFamily: "cursive, var(--font-noto-serif)" }}
                        />
                        {giftNote && (
                          <button
                            onClick={() => setGiftNote("")}
                            className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center opacity-40 hover:opacity-70 transition-opacity"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p
                      className="text-[#9a8c81] text-[9px] tracking-[0.9px] uppercase text-right mt-2"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {giftNote.length} / Max 250 characters
                    </p>
                  </div>
                </div>

                {/* Add to Cart */}
                <div className="flex flex-col gap-4 pt-8">
                  <button
                    className="w-full py-6 bg-[#2d2a26] text-white text-[12px] font-medium tracking-[2.4px] uppercase rounded-full hover:bg-[#1a1815] transition-colors"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Add to Cart
                  </button>
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-[#9a8c81] shrink-0" />
                      <span className="text-[#9a8c81] text-[10px] font-medium tracking-[1px] uppercase" style={{ fontFamily: "var(--font-inter)" }}>
                        Hand-Delivered
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Leaf className="w-3 h-3 text-[#9a8c81] shrink-0" />
                      <span className="text-[#9a8c81] text-[10px] font-medium tracking-[1px] uppercase" style={{ fontFamily: "var(--font-inter)" }}>
                        7-Day Freshness
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#9a8c81] shrink-0" />
                      <span className="text-[#9a8c81] text-[10px] font-medium tracking-[1px] uppercase" style={{ fontFamily: "var(--font-inter)" }}>
                        Secure
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Related Products ── */}
          <div className="border-t border-[rgba(45,42,38,0.05)] pt-20 flex flex-col gap-16">
            <div className="flex items-center justify-between px-4">
              <h2
                className="text-[#2d2a26] text-[36px] font-light leading-[40px]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                You may also like
              </h2>
              <Link
                href="/products"
                className="text-[#9a8c81] text-[11px] tracking-[2.2px] uppercase border-b border-[#9a8c81] pb-1 hover:text-[#2d2a26] hover:border-[#2d2a26] transition-colors"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-12">
              {related.map((p) => (
                <RelatedProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Chat Live */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-[#f8e1da] rounded-full shadow-[0px_4px_20px_0px_rgba(138,109,93,0.1)] flex items-center justify-center hover:bg-[#f0cfc4] transition-colors z-50">
        <MessageCircle className="w-6 h-6 text-[#c2a571]" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="bg-[#f9f7f2] min-h-screen" />}>
      <ProductDetailContent />
    </Suspense>
  );
}
