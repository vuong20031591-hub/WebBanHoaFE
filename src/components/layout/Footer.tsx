import Link from "next/link";
import { Facebook, Flower2, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#f0e5de] bg-white">
      <div className="mx-auto max-w-[1280px] px-6 pb-8 pt-20 sm:px-8 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.25fr)_0.8fr_0.8fr_1fr]">
          <div className="max-w-[280px]">
            <div className="flex items-center gap-3">
              <Flower2 className="h-6 w-6 text-[#d0bb95]" />
              <span
                className="text-[20px] font-medium text-[#2d2a26]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                Floral Boutique
              </span>
            </div>

            <p
              className="mt-8 text-[14px] font-light leading-7 text-[#7b6d64]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Redefining the floral experience with curated aesthetics and sustainable
              practices. Hand-crafted in our local studio.
            </p>

            <div className="mt-8 flex gap-4">
              <Link
                href="https://www.facebook.com/le.ho.minh.quan.2024?locale=vi_VN"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8f2ec] text-[#8b776b] transition-colors hover:bg-[#eee2d8]"
              >
                <Facebook className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d0bb95]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Shop
            </p>
            <div className="mt-6 flex flex-col gap-4">
              {[
                { label: "All Flowers", href: "/products" },
                { label: "Categories", href: "/#categories" },
                { label: "Latest", href: "/#latest" },
                { label: "Gifts", href: "/products" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-[14px] font-light text-[#7b6d64] transition-colors hover:text-[#2d2a26]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d0bb95]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Services
            </p>
            <div className="mt-6 flex flex-col gap-4">
              {[
                { label: "Weddings", href: "/events#weddings" },
                { label: "Occasions", href: "/events#occasions" },
                { label: "Corporate", href: "/events#corporate" },
                { label: "Our Story", href: "/our-story" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-[14px] font-light text-[#7b6d64] transition-colors hover:text-[#2d2a26]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d0bb95]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Contact
            </p>
            <div className="mt-6 flex flex-col gap-5">
              <div className="flex items-center gap-3 text-[#7b6d64]">
                <Mail className="h-5 w-5 shrink-0" />
                <span className="text-[14px] font-light" style={{ fontFamily: "var(--font-inter)" }}>
                  hello@floralboutique.com
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#7b6d64]">
                <MapPin className="h-5 w-5 shrink-0" />
                <span className="text-[14px] font-light" style={{ fontFamily: "var(--font-inter)" }}>
                  123 Bloom Street, NY
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#7b6d64]">
                <Phone className="h-5 w-5 shrink-0" />
                <span className="text-[14px] font-light" style={{ fontFamily: "var(--font-inter)" }}>
                  +1 (555) 000-1111
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-5 border-t border-[#f0e5de] pt-6 text-[11px] text-[#a3948a] sm:flex-row sm:items-center sm:justify-between">
          <p style={{ fontFamily: "var(--font-inter)" }}>
            © 2026 Floral Boutique. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6">
            {[
              { label: "Privacy Policy", href: "/privacy-policy" },
              { label: "Terms of Service", href: "/terms-of-service" },
              { label: "Shipping Info", href: "/shipping-info" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-[#7b6d64]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
