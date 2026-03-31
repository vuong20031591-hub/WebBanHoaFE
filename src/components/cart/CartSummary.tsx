"use client";

import { useRouter } from "next/navigation";
import { formatCurrency } from "./constants";

interface CartSummaryProps {
  hasItems: boolean;
  isHydrating: boolean;
  shipping: number;
  subtotal: number;
  total: number;
}

export function CartSummary({
  hasItems,
  isHydrating,
  shipping,
  subtotal,
  total,
}: CartSummaryProps) {
  const router = useRouter();

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <aside className="xl:sticky xl:top-[112px]">
      <div className="overflow-hidden border border-[#f3f0ec] bg-white px-10 py-10">
        {isHydrating ? (
          <div className="animate-pulse space-y-6">
            <div className="mx-auto h-8 w-40 rounded-full bg-[rgba(138,109,93,0.12)]" />
            <div className="space-y-4">
              <div className="h-5 rounded-full bg-[rgba(138,109,93,0.1)]" />
              <div className="h-5 rounded-full bg-[rgba(138,109,93,0.1)]" />
              <div className="h-5 rounded-full bg-[rgba(138,109,93,0.1)]" />
            </div>
            <div className="h-14 rounded-full bg-[rgba(138,109,93,0.14)]" />
          </div>
        ) : (
          <>
            <h2
              className="text-center text-[24px] italic leading-[32px] text-[var(--color-cart-ink)]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Order Overview
            </h2>
            <div className="mt-10 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <span
                  className="pt-0.5 text-[12px] uppercase leading-[16px] tracking-[1.2px] text-[rgba(138,109,93,0.6)]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  Subtotal
                </span>
                <span
                  className="text-[14px] leading-[20px] tracking-[0.35px] text-[var(--color-cart-ink)]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span
                  className="pt-0.5 text-[12px] uppercase leading-[16px] tracking-[1.2px] text-[rgba(138,109,93,0.6)]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  Shipping
                </span>
                <span
                  className="text-[14px] leading-[20px] tracking-[0.35px] text-[var(--color-cart-ink)]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {formatCurrency(shipping)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span
                  className="text-[12px] uppercase leading-[16px] tracking-[1.2px] text-[rgba(138,109,93,0.6)]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  Gift Wrap
                </span>
                <span
                  className="text-[12px] uppercase leading-[16px] tracking-[1.2px] text-[var(--color-cart-gold)]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {hasItems ? "Complimentary" : "Unavailable"}
                </span>
              </div>
              <div className="flex items-end justify-between gap-4 border-t border-[#f3f0ec] pt-6">
                <span
                  className="pb-1 text-[20px] leading-[28px] text-[var(--color-cart-ink)]"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  Total
                </span>
                <span
                  className="text-[24px] leading-[32px] text-[var(--color-cart-warm)]"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
            <button
              type="button"
              disabled={!hasItems}
              onClick={handleCheckout}
              className="mt-10 w-full bg-[var(--color-cart-warm)] px-6 py-5 text-center text-[11px] uppercase leading-[16.5px] tracking-[2.2px] text-white transition hover:bg-[#775f51] disabled:cursor-not-allowed disabled:opacity-45"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Secure Checkout
            </button>
            <p
              className="mt-6 text-center text-[10px] leading-[20px] text-[rgba(138,109,93,0.5)]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Every bouquet is artisanal and hand-tied for arrival within 24
              hours of selection.
            </p>
          </>
        )}
      </div>
    </aside>
  );
}
