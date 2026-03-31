"use client";

import { useState } from "react";
import type { PaymentMethod as PaymentMethodType } from "@/lib/checkout/types";

interface PaymentMethodProps {
  onSelect?: (method: PaymentMethodType) => void;
}

export function PaymentMethod({ onSelect }: PaymentMethodProps) {
  const [selected, setSelected] = useState<PaymentMethodType>("qr");

  const handleSelect = (method: PaymentMethodType) => {
    setSelected(method);
    onSelect?.(method);
  };

  return (
    <div className="space-y-16">
      <div className="flex items-center justify-between">
        <h2
          className="text-[24px] font-medium leading-[32px] text-[#2c2825]"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Payment Method
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
            SECURE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleSelect("qr")}
          className={`flex flex-col items-center gap-4 rounded-2xl p-6 transition ${
            selected === "qr"
              ? "bg-white"
              : "bg-[rgba(255,255,255,0.5)]"
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              selected === "qr" ? "bg-[#d4a373]" : "bg-[#f9fafb]"
            }`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className={selected === "qr" ? "text-white" : "text-[#9ca3af]"}
            >
              <path
                d="M3 11H11V3H3V11ZM5 5H9V9H5V5ZM3 21H11V13H3V21ZM5 15H9V19H5V15ZM13 3V11H21V3H13ZM19 9H15V5H19V9ZM19 19H21V21H19V19ZM13 13H15V15H13V13ZM15 15H17V17H15V15ZM13 17H15V19H13V17ZM15 19H17V21H15V19ZM17 17H19V19H17V17ZM17 13H19V15H17V13ZM19 15H21V17H19V15Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span
            className="text-[11px] font-bold leading-[16.5px] tracking-[1.1px] text-[#2c2825]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            QR SCAN
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect("cash")}
          className={`flex flex-col items-center gap-4 rounded-2xl p-6 transition ${
            selected === "cash"
              ? "bg-white"
              : "bg-[rgba(255,255,255,0.5)]"
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              selected === "cash" ? "bg-[#d4a373]" : "bg-[#f9fafb]"
            }`}
          >
            <svg
              width="22"
              height="16"
              viewBox="0 0 22 16"
              fill="none"
              className={selected === "cash" ? "text-white" : "text-[#9ca3af]"}
            >
              <path
                d="M20 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H20C21.1 16 22 15.1 22 14V2C22 0.9 21.1 0 20 0ZM20 14H2V2H20V14ZM11 4C12.66 4 14 5.34 14 7C14 8.66 12.66 10 11 10C9.34 10 8 8.66 8 7C8 5.34 9.34 4 11 4ZM5 4C5 5.1 4.1 6 3 6V8C4.1 8 5 8.9 5 10H7C7 8.9 7.9 8 9 8V6C7.9 6 7 5.1 7 4H5ZM17 4C17 5.1 17.9 6 19 6V8C17.9 8 17 8.9 17 10H15C15 8.9 14.1 8 13 8V6C14.1 6 15 5.1 15 4H17Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span
            className="text-[11px] font-bold leading-[16.5px] tracking-[1.1px] text-[#2c2825]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            CASH
          </span>
        </button>
      </div>
    </div>
  );
}
