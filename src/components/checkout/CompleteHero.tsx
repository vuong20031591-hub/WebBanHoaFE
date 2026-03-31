import { Check } from "lucide-react";
import { COMPLETE_SUCCESS_COPY } from "./complete.constants";

interface CompleteHeroProps {
  hasItems: boolean;
  isHydrating: boolean;
  orderNumber: string;
}

export function CompleteHero({
  hasItems,
  isHydrating,
  orderNumber,
}: CompleteHeroProps) {
  const showSuccessState = isHydrating || hasItems;
  const title = showSuccessState
    ? COMPLETE_SUCCESS_COPY.title
    : COMPLETE_SUCCESS_COPY.emptyTitle;
  const description = showSuccessState
    ? `Your order #${orderNumber} ${COMPLETE_SUCCESS_COPY.description}`
    : COMPLETE_SUCCESS_COPY.emptyDescription;

  return (
    <section className="mx-auto flex max-w-[1040px] flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_12px_35px_rgba(138,109,93,0.08)]">
        <Check className="h-6 w-6 text-[#d4a373]" strokeWidth={2.5} />
      </div>
      <h1
        className="mt-8 text-[42px] font-light leading-[1] text-[#2c2825] md:text-[60px]"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        {title}
      </h1>
      <p
        className="mt-6 max-w-[448px] text-[14px] font-light leading-5 tracking-[0.35px] text-[#9ca3af]"
        style={{ fontFamily: "var(--font-montserrat)" }}
      >
        {isHydrating ? "Preparing your order details..." : description}
      </p>
    </section>
  );
}
