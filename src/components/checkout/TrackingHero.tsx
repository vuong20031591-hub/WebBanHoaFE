import { TRACKING_COPY } from "./tracking.constants";

interface TrackingHeroProps {
  orderMeta: string;
}

export function TrackingHero({ orderMeta }: TrackingHeroProps) {
  return (
    <header className="max-w-[1040px]">
      <h1
        className="text-[42px] font-light leading-[1] text-[#2c2825] md:text-[48px]"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        {TRACKING_COPY.pageTitle}
      </h1>
      <p
        className="mt-4 text-[14px] font-light leading-5 tracking-[0.35px] text-[#9ca3af]"
        style={{ fontFamily: "var(--font-montserrat)" }}
      >
        {orderMeta}
      </p>
    </header>
  );
}
