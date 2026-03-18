"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  ShoppingCart,
  User,
  Search,
  Flower2,
  Heart,
  Plus,
  Mail,
  Phone,
  MapPin,
  Facebook,
  PackageSearch,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Asset URLs từ Figma MCP
───────────────────────────────────────────── */
const IMG_P1 = "https://www.figma.com/api/mcp/asset/6dc9572c-6c1b-4558-975e-60c50eaf59ea";
const IMG_P2 = "https://www.figma.com/api/mcp/asset/6fa53fcd-6101-449b-af87-4c1d5242fed8";
const IMG_P3 = "https://www.figma.com/api/mcp/asset/695d3726-f8ff-41f9-a4ce-45350697110c";
const IMG_P4 = "https://www.figma.com/api/mcp/asset/c4e419a2-149a-4620-96ce-75cb9c5d0e24";
const IMG_P5 = "https://www.figma.com/api/mcp/asset/0f3cad03-51e6-4c1f-ae98-09366f302d1c";
const IMG_P6 = "https://www.figma.com/api/mcp/asset/1d3abb28-128d-4a5b-b94a-a750d4ebb00e";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Product {
  id: number;
  name: string;
  price: number;
  occasion: string;
  style: string;
  image: string;
}

interface PageData {
  content: Product[];
  totalPages: number;
  totalElements: number;
  number: number;
  last: boolean;
  first: boolean;
}

/* ─────────────────────────────────────────────
   Mock data (thay bằng API thật sau)
───────────────────────────────────────────── */
const ALL_PRODUCTS: Product[] = [
  { id: 1, name: "Ethereal Blush",   price: 98,  occasion: "Birthday",    style: "Minimalist",    image: IMG_P1 },
  { id: 2, name: "Sunset Whisper",   price: 98,  occasion: "Anniversary", style: "Classic Luxe",  image: IMG_P2 },
  { id: 3, name: "Morning Dew",      price: 98,  occasion: "Sympathy",    style: "Wild & Organic", image: IMG_P3 },
  { id: 4, name: "Pure Grace",       price: 120, occasion: "Birthday",    style: "Classic Luxe",  image: IMG_P4 },
  { id: 5, name: "Pastel Dream",     price: 85,  occasion: "Just Because", style: "Minimalist",   image: IMG_P5 },
  { id: 6, name: "Rosewood Charm",   price: 110, occasion: "Anniversary", style: "Wild & Organic", image: IMG_P6 },
];

const PAGE_SIZE = 6;

/* ─────────────────────────────────────────────
   Navbar (dùng chung style với Homepage)
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
              { label: "Shop All", href: "/products" },
              { label: "Weddings", href: "/products?style=Classic+Luxe" },
              { label: "Occasions", href: "/products?occasion=Birthday" },
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
   Product Card (Signature Card)
───────────────────────────────────────────── */
function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-[rgba(255,255,255,0.4)] backdrop-blur-sm rounded-[32px] overflow-hidden w-[329px] shadow-[inset_0px_0.8px_0px_0px_rgba(255,255,255,0.6),inset_0px_-0.8px_0px_0px_rgba(255,255,255,0.6)]">
      {/* Image */}
      <div className="relative mx-[20.8px] mt-[20.8px] h-[360px]">
        <div className="relative w-full h-full rounded-tl-[200px] rounded-tr-[200px] rounded-bl-[20px] rounded-br-[20px] overflow-hidden shadow-sm bg-[#f7f3ed]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="288px"
            className="object-cover"
          />
        </div>
        {/* Favorite */}
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-5 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${liked ? "fill-rose-400 text-rose-400" : "text-[#5c6b5e]"}`}
          />
        </button>
      </div>

      {/* Info */}
      <div className="mx-[20.8px] mt-3 pb-[20.8px]">
        <p
          className="text-[#2d2a26] text-[20px] font-light leading-[28px] text-center"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          {product.name}
        </p>
        <p
          className="text-[#5c6b5e] text-[18px] font-light leading-[28px] text-center mt-1"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          ${product.price.toFixed(2)}
        </p>
        {/* Move to Cart */}
        <button
          className="mt-4 w-full h-[54px] flex items-center justify-center gap-2 rounded-[12px] border border-[rgba(208,187,149,0.3)] hover:bg-[rgba(208,187,149,0.08)] transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <Plus className="w-5 h-5 text-[#d0bb95]" />
          <span className="text-[#d0bb95] text-[12px] font-bold tracking-[1.2px] uppercase">
            Move to Cart
          </span>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sidebar Filter
───────────────────────────────────────────── */
interface SidebarProps {
  occasion: string;
  style: string;
  minPrice: string;
  maxPrice: string;
  onChange: (key: string, value: string) => void;
}

const OCCASIONS = ["Birthday", "Anniversary", "Sympathy", "Just Because"];
const STYLES = ["Minimalist", "Wild & Organic", "Classic Luxe"];

function Sidebar({ occasion, style, minPrice, maxPrice, onChange }: SidebarProps) {
  const divider = <div className="border-t border-[rgba(45,42,38,0.1)] my-4" />;

  return (
    <aside className="w-[224px] shrink-0">
      {/* OCCASION */}
      <p
        className="text-[#2d2a26] text-[16px] font-bold tracking-[3px] mb-4"
        style={{ fontFamily: "var(--font-noto-serif)" }}
      >
        OCCASION
      </p>
      {divider}
      <div className="flex flex-col gap-3">
        {OCCASIONS.map((o) => (
          <label key={o} className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => onChange("occasion", occasion === o ? "" : o)}
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
                occasion === o
                  ? "border-[#d0bb95] bg-[#d0bb95]"
                  : "border-[#9ca3af] group-hover:border-[#d0bb95]"
              }`}
            >
              {occasion === o && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            <span
              className="text-[#5c6b5e] text-[16px] leading-[1.4]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {o}
            </span>
          </label>
        ))}
      </div>

      {/* STYLE */}
      <p
        className="text-[#2d2a26] text-[16px] font-bold tracking-[3px] mt-8 mb-4"
        style={{ fontFamily: "var(--font-noto-serif)" }}
      >
        STYLE
      </p>
      {divider}
      <div className="flex flex-col gap-3">
        {STYLES.map((s) => (
          <label key={s} className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => onChange("style", style === s ? "" : s)}
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
                style === s
                  ? "border-[#d0bb95] bg-[#d0bb95]"
                  : "border-[#9ca3af] group-hover:border-[#d0bb95]"
              }`}
            >
              {style === s && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            <span
              className="text-[#5c6b5e] text-[16px] leading-[1.4]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {s}
            </span>
          </label>
        ))}
      </div>

      {/* PRICE */}
      <p
        className="text-[#2d2a26] text-[16px] font-bold tracking-[3px] mt-8 mb-4"
        style={{ fontFamily: "var(--font-noto-serif)" }}
      >
        PRICE
      </p>
      {divider}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-10 bg-[rgba(156,163,175,0.2)] rounded flex items-center px-3">
          <span className="text-[#9ca3af] text-[14px] mr-1" style={{ fontFamily: "var(--font-inter)" }}>$</span>
          <input
            type="number"
            placeholder="0"
            value={minPrice}
            onChange={(e) => onChange("minPrice", e.target.value)}
            className="w-full bg-transparent text-[#9ca3af] text-[14px] outline-none"
            style={{ fontFamily: "var(--font-inter)" }}
          />
        </div>
        <span className="text-[rgba(92,107,94,0.4)] text-[28px] font-thin">-</span>
        <div className="flex-1 h-10 bg-[rgba(156,163,175,0.2)] rounded flex items-center px-3">
          <span className="text-[#9ca3af] text-[14px] mr-1" style={{ fontFamily: "var(--font-inter)" }}>$</span>
          <input
            type="number"
            placeholder="500"
            value={maxPrice}
            onChange={(e) => onChange("maxPrice", e.target.value)}
            className="w-full bg-transparent text-[#9ca3af] text-[14px] outline-none"
            style={{ fontFamily: "var(--font-inter)" }}
          />
        </div>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────
   Join the Bloom Club
───────────────────────────────────────────── */
function BloomClub() {
  return (
    <section className="bg-[#f7f3ed] py-16">
      <div className="max-w-[896px] mx-auto text-center">
        <h2
          className="text-black text-[48px] font-normal leading-[48px] mb-6"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          Join the Bloom Club
        </h2>
        <p
          className="text-[rgba(92,107,94,0.8)] text-[18px] font-light leading-[28px] mb-10"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Receive styling tips and exclusive collection launches.
        </p>
        <div className="flex items-center justify-center mx-auto w-[512px] h-[61px] bg-[rgba(208,187,149,0.05)] rounded overflow-hidden border border-[rgba(208,187,149,0.15)]">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 h-full bg-transparent px-5 text-[18px] font-light text-[rgba(92,107,94,0.8)] outline-none placeholder-[rgba(92,107,94,0.5)]"
            style={{ fontFamily: "var(--font-inter)" }}
          />
          <button
            className="h-full px-8 text-[#d0bb95] text-[11px] font-bold tracking-[3.3px] uppercase hover:bg-[rgba(208,187,149,0.1)] transition-colors border-l border-[rgba(208,187,149,0.15)]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Subscribe
          </button>
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
          <div className="w-[192px] flex flex-col gap-8 shrink-0">
            <div className="flex items-center gap-3">
              <Flower2 className="text-[#d0bb95] w-6 h-6 shrink-0" />
              <span className="text-[#2d2a26] text-[20px] font-medium" style={{ fontFamily: "var(--font-noto-serif)" }}>
                Floral Boutique
              </span>
            </div>
            <p className="text-[#5c6b5e] text-[14px] font-light leading-[22.75px]" style={{ fontFamily: "var(--font-inter)" }}>
              Redefining the floral experience with curated aesthetics and sustainable practices.
            </p>
            <button className="w-11 h-11 bg-[#f7f3ed] rounded-full flex items-center justify-center shadow-sm hover:bg-[#ece4da] transition-colors w-fit">
              <Facebook className="w-5 h-5 text-[#5c6b5e]" />
            </button>
          </div>
          {[
            { title: "SHOP", links: ["All Flowers", "Best Sellers", "Subscriptions", "Gifts"] },
            { title: "SERVICES", links: ["Weddings", "Events", "Corporate", "Custom Designs"] },
          ].map((col) => (
            <div key={col.title} className="flex flex-col gap-6 w-[192px]">
              <p className="text-[#d0bb95] text-[10px] font-bold tracking-[2px] uppercase" style={{ fontFamily: "var(--font-noto-serif)" }}>
                {col.title}
              </p>
              <div className="flex flex-col gap-4">
                {col.links.map((t) => (
                  <Link key={t} href="#" className="text-[#5c6b5e] text-[14px] font-light hover:text-[#2d2a26] transition-colors" style={{ fontFamily: "var(--font-inter)" }}>
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-6 w-[203px]">
            <p className="text-[#d0bb95] text-[10px] font-bold tracking-[2px] uppercase" style={{ fontFamily: "var(--font-noto-serif)" }}>CONTACT</p>
            <div className="flex flex-col gap-4">
              {[
                { Icon: Mail, text: "hello@floralboutique.com" },
                { Icon: MapPin, text: "123 Bloom Street, NY" },
                { Icon: Phone, text: "+1 (555) 000-1111" },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[#5c6b5e] shrink-0" />
                  <span className="text-[#5c6b5e] text-[14px] font-light" style={{ fontFamily: "var(--font-inter)" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[#eee4e1] pt-6 flex items-center justify-between">
          <p className="text-[rgba(92,107,94,0.7)] text-[11px] font-light tracking-[0.275px]" style={{ fontFamily: "var(--font-inter)" }}>
            © 2026 Floral Boutique. All rights reserved.
          </p>
          <div className="flex gap-10">
            {["Privacy Policy", "Terms of Service", "Shipping Info"].map((t) => (
              <Link key={t} href="#" className="text-[rgba(92,107,94,0.7)] text-[11px] font-light tracking-[0.275px] hover:text-[#5c6b5e] transition-colors" style={{ fontFamily: "var(--font-inter)" }}>
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
   Page
───────────────────────────────────────────── */
export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    occasion: searchParams.get("occasion") || "",
    style: searchParams.get("style") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  /* Sync filter state → URL params */
  const applyFilters = useCallback(
    (newFilters: typeof filters) => {
      const p = new URLSearchParams();
      if (newFilters.occasion) p.set("occasion", newFilters.occasion);
      if (newFilters.style) p.set("style", newFilters.style);
      if (newFilters.minPrice) p.set("minPrice", newFilters.minPrice);
      if (newFilters.maxPrice) p.set("maxPrice", newFilters.maxPrice);
      p.set("page", "0");
      router.push(`${pathname}?${p.toString()}`);
    },
    [pathname, router]
  );

  const handleFilterChange = (key: string, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    applyFilters(updated);
  };

  /* Fetch / filter mock data */
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 300));

    const params = new URLSearchParams(searchParamsString);
    const fOccasion = params.get("occasion") || "";
    const fStyle = params.get("style") || "";
    const fMin = Number(params.get("minPrice")) || 0;
    const fMax = Number(params.get("maxPrice")) || Number.MAX_SAFE_INTEGER;
    const currentPage = Number(params.get("page")) || 0;

    const filtered = ALL_PRODUCTS.filter((p) => {
      const matchOccasion = !fOccasion || p.occasion === fOccasion;
      const matchStyle = !fStyle || p.style === fStyle;
      const matchPrice = p.price >= fMin && p.price <= fMax;
      return matchOccasion && matchStyle && matchPrice;
    });

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / PAGE_SIZE) || 1;
    const start = currentPage * PAGE_SIZE;

    setPageData({
      content: filtered.slice(start, start + PAGE_SIZE),
      totalPages,
      totalElements,
      number: currentPage,
      first: currentPage === 0,
      last: currentPage >= totalPages - 1,
    });
    setIsLoading(false);
  }, [searchParamsString]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="bg-[#f7f3ed] min-h-screen">
      <Navbar />

      {/* ── Header ── */}
      <div className="bg-[#f7f3ed] h-[245px] flex items-center justify-center">
        <div className="text-center">
          <p
            className="text-[#d0bb95] text-[10px] font-bold tracking-[4px] uppercase mb-4"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            THE CURATED GALLERY
          </p>
          <h1
            className="text-black text-[72px] font-light leading-[72px] tracking-[4px]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            All Products
          </h1>
          <p
            className="text-[rgba(92,107,94,0.8)] text-[18px] font-light leading-[29.25px] mt-3 max-w-[580px]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Designed to breathe life into every corner of your home with organic textures and timeless grace.
          </p>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="max-w-[1280px] mx-auto px-[54px] py-14 flex gap-16">
        {/* Sidebar */}
        <Sidebar
          occasion={filters.occasion}
          style={filters.style}
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onChange={handleFilterChange}
        />

        {/* Product grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-[329px] h-[542px] bg-white/40 rounded-[32px] animate-pulse" />
              ))}
            </div>
          ) : !pageData || pageData.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <PackageSearch className="w-12 h-12 text-[#d0bb95]" />
              <p
                className="text-[#5c6b5e] text-[18px] font-light"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                No arrangements found
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-6">
                {pageData.content.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {pageData.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <button
                    disabled={pageData.first}
                    onClick={() =>
                      router.push(
                        `${pathname}?${new URLSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: (pageData.number - 1).toString(),
                        })}`
                      )
                    }
                    className="w-10 h-10 rounded-full border border-[rgba(208,187,149,0.3)] text-[#d0bb95] hover:bg-[rgba(208,187,149,0.1)] transition-colors disabled:opacity-30 flex items-center justify-center"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    ‹
                  </button>
                  {Array.from({ length: pageData.totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        router.push(
                          `${pathname}?${new URLSearchParams({
                            ...Object.fromEntries(searchParams),
                            page: i.toString(),
                          })}`
                        )
                      }
                      className={`w-10 h-10 rounded-full text-[14px] font-medium transition-colors ${
                        pageData.number === i
                          ? "bg-[#d0bb95] text-white"
                          : "border border-[rgba(208,187,149,0.3)] text-[#d0bb95] hover:bg-[rgba(208,187,149,0.1)]"
                      }`}
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={pageData.last}
                    onClick={() =>
                      router.push(
                        `${pathname}?${new URLSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: (pageData.number + 1).toString(),
                        })}`
                      )
                    }
                    className="w-10 h-10 rounded-full border border-[rgba(208,187,149,0.3)] text-[#d0bb95] hover:bg-[rgba(208,187,149,0.1)] transition-colors disabled:opacity-30 flex items-center justify-center"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Join Bloom Club ── */}
      <BloomClub />

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
