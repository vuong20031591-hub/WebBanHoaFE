"use client";

import { Banknote, QrCode } from "lucide-react";
import type { PaymentMethod as PaymentMethodType } from "@/lib/checkout/types";
import { useLocale } from "@/src/contexts";

interface PaymentMethodProps {
  onSelect: (method: PaymentMethodType) => void;
  value: PaymentMethodType;
}

const PAYMENT_OPTIONS: Array<{
  id: PaymentMethodType;
  label: string;
  caption: string;
  Icon: typeof QrCode;
}> = [
  {
    id: "vietqr",
    label: "VietQR",
    caption: "Scan with any banking app",
    Icon: QrCode,
  },
  {
    id: "cod",
    label: "COD",
    caption: "Pay when receiving flowers",
    Icon: Banknote,
  },
];

export function PaymentMethod({ onSelect, value }: PaymentMethodProps) {
  const { locale } = useLocale();
  const handleSelect = (method: PaymentMethodType) => {
    onSelect(method);
  };

  const copy =
    locale === "vi"
      ? {
          title: "Phuong thuc thanh toan",
          secure: "BAO MAT",
          options: {
            vietqr: "Quet bang ung dung ngan hang",
            cod: "Thanh toan khi nhan hoa",
          },
        }
      : {
          title: "Payment Method",
          secure: "SECURE",
          options: {
            vietqr: "Scan with any banking app",
            cod: "Pay when receiving flowers",
          },
        };

  return (
    <div className="space-y-16">
      <div className="flex items-center justify-between">
        <h2
          className="text-[24px] font-medium leading-[32px] text-[#2c2825]"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {copy.title}
        </h2>

        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z"
                fill="#3a3532"
              />
              <path
                d="M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z"
                fill="white"
              />
            </svg>
          </div>
          <span
            className="text-[10px] font-bold leading-[15px] tracking-[1px] text-[#3a3532]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {copy.secure}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PAYMENT_OPTIONS.map(({ id, label, Icon }) => {
          const isActive = value === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => handleSelect(id)}
              className={`flex flex-col items-center gap-4 rounded-2xl border p-6 text-center transition ${
                isActive
                  ? "border-[#e2c3a5] bg-white shadow-[0_10px_24px_rgba(168,134,114,0.12)]"
                  : "border-transparent bg-[rgba(255,255,255,0.5)] hover:bg-white"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isActive ? "bg-[#d4a373]" : "bg-[#f9fafb]"
                }`}
              >
                <Icon className={isActive ? "h-5 w-5 text-white" : "h-5 w-5 text-[#9ca3af]"} />
              </div>
              <div>
                <p
                  className="text-[11px] font-bold leading-[16.5px] tracking-[1.1px] text-[#2c2825]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {label}
                </p>
                <p
                  className="mt-1 text-[11px] leading-5 text-[#8b7c72]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {id === "vietqr" ? copy.options.vietqr : copy.options.cod}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
