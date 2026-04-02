import Link from "next/link";
import { ShoppingCart, User, Search, Flower2 } from "lucide-react";

export function Navbar() {
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
              { label: "Categories", href: "/products" },
              { label: "Latest", href: "/products" },
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
            href="/cart"
            className="w-10 h-10 flex items-center justify-center hover:bg-[#f1eeea] rounded-full transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-[#2d2a26]" />
          </Link>
          <Link
            href="/profile"
            className="w-9 h-9 flex items-center justify-center hover:bg-[#f1eeea] rounded-full transition-colors"
          >
            <User className="w-5 h-5 text-[#2d2a26]" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
