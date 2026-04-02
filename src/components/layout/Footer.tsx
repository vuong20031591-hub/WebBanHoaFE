import Link from "next/link";
import { Flower2, Mail, Phone, MapPin, Facebook } from "lucide-react";

export function Footer() {
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
            <div className="flex gap-5">
              <button className="w-11 h-11 bg-[#f7f3ed] rounded-full flex items-center justify-center shadow-sm hover:bg-[#ece4da] transition-colors">
                <Facebook className="w-5 h-5 text-[#5c6b5e]" />
              </button>
            </div>
          </div>

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
