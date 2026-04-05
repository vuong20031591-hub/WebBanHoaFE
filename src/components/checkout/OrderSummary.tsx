"use client";

import Image from "next/image";
import type { CartItem } from "@/lib/cart/types";
import { formatCurrency } from "@/lib/currency";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/mappers/product";
import { useLocale } from "@/src/contexts";

interface OrderSummaryProps {
  items: CartItem[];
  redeemedPoints?: number;
  rewardsDiscount?: number;
  onPlaceOrder?: () => void;
  isSubmitting?: boolean;
}

export function OrderSummary({
  items,
  redeemedPoints = 0,
  rewardsDiscount = 0,
  onPlaceOrder,
  isSubmitting = false,
}: OrderSummaryProps) {
  const { locale } = useLocale();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const appliedDiscount = Math.max(0, Math.min(rewardsDiscount, subtotal));
  const total = subtotal - appliedDiscount;

  const copy =
    locale === "vi"
      ? {
          title: "Tong quan don hang",
          qty: "SL",
          subtotal: "TAM TINH",
          rewards: "BLOOM REWARDS ({points} DIEM)",
          total: "Tong",
          creating: "Dang tao don...",
          placeOrder: "Dat don ngay",
          footer: "BO HOA CUA BAN SE DUOC THUC HIEN THU CONG VA GIAO TAN TAY.",
        }
      : {
          title: "Order Summary",
          qty: "QTY",
          subtotal: "SUBTOTAL",
          rewards: "BLOOM REWARDS POINTS ({points} PTS)",
          total: "Total",
          creating: "Creating Order...",
          placeOrder: "Place Your Order",
          footer: "YOUR ARRANGEMENT WILL BE HAND-CRAFTED AND DELIVERED WITH CARE.",
        };

  return (
    <aside className="rounded-[40px] bg-white p-10">
      <h2
        className="text-[24px] font-medium leading-[32px] text-[#3a3532]"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        {copy.title}
      </h2>

      <div className="mt-16 space-y-8">
        {items.map((item) => (
          <div key={`${item.productId}-${item.size}`} className="flex gap-5">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-tl-[80px] rounded-tr-[80px] rounded-bl-[8px] rounded-br-[8px]">
              <Image
                src={item.productImage || DEFAULT_PRODUCT_IMAGE}
                alt={item.productName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center gap-[3.5px]">
              <h3
                className="text-[18px] font-medium leading-[22.5px] text-[#3a3532]"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {item.productName}
              </h3>
              <p
                className="text-[11px] font-semibold leading-[16.5px] tracking-[1.1px] text-[#9ca3af]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {item.size.toUpperCase()} / {copy.qty} {item.quantity}
              </p>
              <p
                className="text-[14px] font-medium leading-5 text-[#3a3532]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {formatCurrency(item.price, locale)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4 border-t border-[#f3f0ec] pt-8">
        <div className="flex items-center justify-between">
          <span
            className="text-[12px] font-medium leading-4 tracking-[0.3px] text-[#9ca3af]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {copy.subtotal}
          </span>
          <span
            className="text-[12px] font-medium leading-4 tracking-[0.3px] text-[#3a3532]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {formatCurrency(subtotal, locale)}
          </span>
        </div>

        {appliedDiscount > 0 ? (
          <div className="flex items-center justify-between">
            <span
              className="text-[12px] font-medium leading-4 tracking-[0.3px] text-[#9ca3af]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
                {copy.rewards.replace("{points}", String(redeemedPoints))}
            </span>
            <span
              className="text-[12px] font-medium leading-4 tracking-[0.3px] text-[#166534]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
                -{formatCurrency(appliedDiscount, locale)}
            </span>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-[#f3f0ec] pt-4">
          <span
            className="text-[18px] font-medium leading-[28px] text-[#3a3532]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {copy.total}
          </span>
          <span
            className="text-[18px] font-semibold leading-[28px] text-[#3a3532]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {formatCurrency(total, locale)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={items.length === 0 || isSubmitting}
        className="mt-10 flex h-[68px] w-full items-center justify-center gap-2 rounded-full bg-[#8a6d5d] text-[20px] font-medium leading-[28px] tracking-[0.5px] text-white transition hover:bg-[#775f51] disabled:cursor-not-allowed disabled:opacity-50"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        {isSubmitting ? copy.creating : copy.placeOrder}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 0L6.59 1.41L12.17 7H0V9H12.17L6.59 14.59L8 16L16 8L8 0Z"
            fill="white"
          />
        </svg>
      </button>

      <p
        className="mt-6 text-center text-[10px] font-medium leading-[16.25px] tracking-[1px] text-[#9ca3af]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {copy.footer}
      </p>
    </aside>
  );
}
