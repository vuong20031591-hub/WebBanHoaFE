import Image from "next/image";
import { CartItem } from "@/lib/cart";
import {
  getCompleteItemMeta,
  getCompleteProductCount,
  getCompleteSummaryLabel,
} from "./complete.constants";

interface CompleteGiftSummaryProps {
  isHydrating: boolean;
  items: CartItem[];
}

function SummarySkeletonCard() {
  return (
    <div className="space-y-4">
      <div className="aspect-[270/338] rounded-t-[999px] bg-[rgba(138,109,93,0.08)]" />
      <div className="space-y-2">
        <div className="mx-auto h-7 w-40 rounded-full bg-[rgba(138,109,93,0.08)]" />
        <div className="mx-auto h-4 w-32 rounded-full bg-[rgba(138,109,93,0.08)]" />
      </div>
    </div>
  );
}

export function CompleteGiftSummary({
  isHydrating,
  items,
}: CompleteGiftSummaryProps) {
  const productCount = getCompleteProductCount(items);
  const hasSingleProduct = productCount === 1;

  return (
    <section id="order-summary">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2
          className="text-[24px] font-medium leading-8 text-[#2c2825]"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Summary of your gift
        </h2>
        <p
          className="text-[10px] font-bold uppercase leading-[15px] tracking-[1px] text-[#9ca3af]"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          {getCompleteSummaryLabel(items)}
        </p>
      </div>

      {isHydrating ? (
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <SummarySkeletonCard />
          <SummarySkeletonCard />
        </div>
      ) : items.length > 0 ? (
        <div
          className={
            hasSingleProduct
              ? "mt-8 mx-auto max-w-[270px]"
              : "mt-8 grid gap-10 md:grid-cols-2"
          }
        >
          {items.map((item) => (
            <article
              key={`${item.productId}-${item.size}`}
              className="space-y-4"
            >
              <div className="relative aspect-[270/338] overflow-hidden rounded-t-[999px] bg-[#f3ede6]">
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  fill
                  sizes="(max-width: 768px) 100vw, 270px"
                  className="object-cover"
                />
              </div>
              <div className="text-center">
                <h3
                  className="text-[20px] leading-7 text-[#2c2825]"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {item.productName}
                </h3>
                <p
                  className="mt-1 text-[10px] font-semibold uppercase leading-[15px] tracking-[1px] text-[#9ca3af]"
                  style={{ fontFamily: "var(--font-montserrat)" }}
                >
                  {getCompleteItemMeta(item)}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[28px] bg-white px-8 py-10 text-center shadow-[0_18px_45px_rgba(138,109,93,0.06)]">
          <p
            className="text-[20px] leading-7 text-[#2c2825]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Your completed order will appear here.
          </p>
          <p
            className="mt-3 text-[14px] font-light leading-6 text-[#9ca3af]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Add flowers to your cart and place the order to see the full gift
            summary in this layout.
          </p>
        </div>
      )}
    </section>
  );
}
