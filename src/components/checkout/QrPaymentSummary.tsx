import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { CartItem } from "@/lib/cart";
import {
  formatQrPaymentCurrency,
  getQrPaymentItemLabel,
  QR_PAYMENT_COPY,
} from "./qr.constants";

interface QrPaymentSummaryProps {
  isHydrating: boolean;
  items: CartItem[];
  total: number;
}

export function QrPaymentSummary({
  isHydrating,
  items,
  total,
}: QrPaymentSummaryProps) {
  return (
    <aside className="space-y-8">
      <section>
        <p
          className="text-[10px] font-bold uppercase leading-[15px] tracking-[1px] text-[#9ca3af]"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          {QR_PAYMENT_COPY.orderTotalLabel}
        </p>
        <p
          className="mt-4 text-[30px] leading-9 text-[#8a6d5d]"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {formatQrPaymentCurrency(total)}
        </p>
      </section>

      <section className="space-y-4">
        {isHydrating ? (
          <>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[rgba(138,109,93,0.08)]" />
              <div className="h-4 w-32 rounded-full bg-[rgba(138,109,93,0.08)]" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[rgba(138,109,93,0.08)]" />
              <div className="h-4 w-36 rounded-full bg-[rgba(138,109,93,0.08)]" />
            </div>
          </>
        ) : items.length > 0 ? (
          items.map((item) => (
            <article
              key={`${item.productId}-${item.size}`}
              className="flex items-center gap-3"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#f1eeea]">
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <p
                className="text-[10px] font-medium uppercase leading-[15px] tracking-[1px] text-[#6b7280]"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                {getQrPaymentItemLabel(item)}
              </p>
            </article>
          ))
        ) : (
          <div>
            <p
              className="text-[10px] font-medium uppercase leading-[15px] tracking-[1px] text-[#6b7280]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              {QR_PAYMENT_COPY.emptyItemsLabel}
            </p>
            <p
              className="mt-2 text-[11px] leading-[17.875px] text-[#9ca3af]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              {QR_PAYMENT_COPY.emptyItemsText}
            </p>
          </div>
        )}
      </section>

      <section className="pt-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#9ca3af]" strokeWidth={2.2} />
          <p
            className="text-[10px] uppercase leading-[15px] tracking-[1px] text-[#9ca3af]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {QR_PAYMENT_COPY.encryptedSession}
          </p>
        </div>
      </section>
    </aside>
  );
}
