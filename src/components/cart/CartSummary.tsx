"use client";

import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { useLocale } from "@/src/contexts";

interface CartSummaryProps {
  hasItems: boolean;
  isHydrating: boolean;
  subtotal: number;
  total: number;
  isCheckingOut?: boolean;
}

export function CartSummary({
  hasItems,
  isHydrating,
  subtotal,
  total,
  isCheckingOut = false,
}: CartSummaryProps) {
  const router = useRouter();
  const { locale } = useLocale();

  const copy =
    locale === "vi"
      ? {
          title: "Tong quan don hang",
          subtotal: "Tam tinh",
          total: "Tong",
          redirecting: "Dang chuyen huong...",
          checkout: "Thanh toan an toan",
          note: "Moi bo hoa deu duoc thuc hien thu cong va giao toi ban voi su cham chut.",
        }
      : {
          title: "Order Overview",
          subtotal: "Subtotal",
          total: "Total",
          redirecting: "Redirecting...",
          checkout: "Secure Checkout",
          note: "Every bouquet is artisanal and hand-tied for arrival within 24 hours of selection.",
        };

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
              {copy.title}
            </h2>
            <div className="mt-10 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <span
                  className="pt-0.5 text-[12px] uppercase leading-[16px] tracking-[1.2px] text-[rgba(138,109,93,0.6)]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {copy.subtotal}
                </span>
                <span
                  className="text-[14px] leading-[20px] tracking-[0.35px] text-[var(--color-cart-ink)]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {formatCurrency(subtotal, locale)}
                </span>
              </div>
              <div className="flex items-end justify-between gap-4 border-t border-[#f3f0ec] pt-6">
                <span
                  className="pb-1 text-[20px] leading-[28px] text-[var(--color-cart-ink)]"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {copy.total}
                </span>
                <span
                  className="text-[24px] leading-[32px] text-[var(--color-cart-warm)]"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {formatCurrency(total, locale)}
                </span>
              </div>
            </div>
            <button
              type="button"
              disabled={!hasItems || isCheckingOut}
              onClick={handleCheckout}
              className="mt-10 w-full bg-[var(--color-cart-warm)] px-6 py-5 text-center text-[11px] uppercase leading-[16.5px] tracking-[2.2px] text-white transition hover:bg-[#775f51] disabled:cursor-not-allowed disabled:opacity-45"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {isCheckingOut ? copy.redirecting : copy.checkout}
            </button>
            <p
              className="mt-6 text-center text-[10px] leading-[20px] text-[rgba(138,109,93,0.5)]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {copy.note}
            </p>
          </>
        )}
      </div>
    </aside>
  );
}
