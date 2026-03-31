import { ShieldCheck } from "lucide-react";
import {
  formatQrPaymentTimer,
  isQrPaymentCellFilled,
  QR_PAYMENT_COPY,
} from "./qr.constants";

interface QrPaymentCodeCardProps {
  remainingSeconds: number;
}

export function QrPaymentCodeCard({
  remainingSeconds,
}: QrPaymentCodeCardProps) {
  return (
    <section className="rounded-[44px] bg-white px-8 py-8 shadow-[0_28px_60px_rgba(138,109,93,0.08)] sm:px-10 sm:py-10">
      <div className="relative mx-auto w-fit">
        <div className="rounded-[36px] bg-[#fdfaf7] p-4 shadow-[inset_0_0_0_1px_rgba(138,109,93,0.06)]">
          <div className="grid h-[232px] w-[232px] grid-cols-[repeat(21,minmax(0,1fr))] gap-[3px] rounded-[12px] bg-white p-4 sm:h-64 sm:w-64">
            {Array.from({ length: 21 * 21 }, (_, index) => {
              const row = Math.floor(index / 21);
              const col = index % 21;
              const filled = isQrPaymentCellFilled(row, col);

              return (
                <div
                  key={`${row}-${col}`}
                  className={`aspect-square rounded-[1px] ${
                    filled ? "bg-[#2c2825]" : "bg-transparent"
                  }`}
                />
              );
            })}
          </div>
        </div>
        <div className="absolute -right-3 -top-3 flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(138,109,93,0.12)]">
          <ShieldCheck className="h-6 w-6 text-[#d4a373]" strokeWidth={2.25} />
        </div>
      </div>

      <div className="mt-8 text-center">
        <p
          className="text-[11px] font-semibold uppercase leading-[16.5px] tracking-[2.2px] text-[#9ca3af]"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          {QR_PAYMENT_COPY.expiryLabel}
        </p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span
            className="text-[20px] font-light leading-7 tracking-[2px] text-[#2c2825]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {QR_PAYMENT_COPY.expiryPrefix}
          </span>
          <span
            className="text-[20px] font-medium leading-7 tracking-[2px] text-[#2c2825]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {formatQrPaymentTimer(remainingSeconds)}
          </span>
        </div>
      </div>
    </section>
  );
}
