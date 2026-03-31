import Link from "next/link";
import { Banknote, MapPinned } from "lucide-react";
import {
  COMPLETE_AMOUNT_HELPER,
  COMPLETE_NEXT_STEPS,
  COMPLETE_PAYMENT_METHOD,
  formatCompleteCurrency,
} from "./complete.constants";

interface CompleteSidebarProps {
  hasItems: boolean;
  total: number;
}

export function CompleteSidebar({
  hasItems,
  total,
}: CompleteSidebarProps) {
  return (
    <aside className="xl:sticky xl:top-[112px]">
      <div className="rounded-[40px] bg-white px-10 py-10 shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
        <div className="flex items-center gap-4 border-b border-[rgba(138,109,93,0.08)] pb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fdfaf7] text-[#d4a373]">
            <Banknote className="h-5 w-5" strokeWidth={2.15} />
          </div>
          <div>
            <p
              className="text-[10px] font-bold uppercase leading-[12.5px] tracking-[1px] text-[#9ca3af]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              PAYMENT METHOD
            </p>
            <p
              className="mt-1 text-[18px] font-medium leading-7 text-[#2c2825]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {COMPLETE_PAYMENT_METHOD}
            </p>
          </div>
        </div>

        <section className="pt-8">
          <h2
            className="text-[24px] font-medium leading-8 text-[#3a3532]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            What&apos;s Next?
          </h2>
          <p
            className="mt-6 text-[14px] font-light leading-[22.75px] text-[#6b7280]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {hasItems
              ? COMPLETE_NEXT_STEPS
              : "Once an order is placed, you will see payment and delivery details gathered here in the same composition."}
          </p>
          <div className="mt-6 rounded-2xl bg-[#fdfaf7] px-6 py-6">
            <p
              className="text-[10px] font-bold uppercase leading-[15px] tracking-[1.5px] text-[#9ca3af]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              TOTAL TO PAY ON ARRIVAL
            </p>
            <p
              className="mt-2 text-[36px] font-medium leading-10 text-[#8a6d5d]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {formatCompleteCurrency(total)}
            </p>
            <p
              className="mt-2 max-w-[265px] text-[10px] font-medium leading-[12.5px] text-[rgba(138,109,93,0.6)]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              {COMPLETE_AMOUNT_HELPER}
            </p>
          </div>
        </section>

        <div className="mt-10 space-y-4">
          <Link
            href="/checkout/tracking"
            className="flex h-[68px] w-full items-center justify-center gap-3 rounded-full bg-[#8a6d5d] text-white transition hover:bg-[#775f51]"
          >
            <span
              className="text-[20px] font-medium leading-7"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Order Tracking
            </span>
            <MapPinned className="h-5 w-5" strokeWidth={2.1} />
          </Link>
          <Link
            href="/products"
            className="flex h-14 items-center justify-center rounded-full text-[11px] font-bold uppercase leading-[16.5px] tracking-[2.2px] text-[#2c2825] transition hover:bg-[rgba(138,109,93,0.06)]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </aside>
  );
}
