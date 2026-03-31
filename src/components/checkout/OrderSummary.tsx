"use client";

import { useState } from "react";
import Image from "next/image";
import type { CartItem } from "@/lib/cart/types";
import type { DiscountCode } from "@/lib/checkout/types";

interface OrderSummaryProps {
  items: CartItem[];
  onPlaceOrder?: () => void;
}

export function OrderSummary({ items, onPlaceOrder }: OrderSummaryProps) {
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedDiscount?.amount || 0;
  const delivery = 0;
  const total = subtotal - discount + delivery;

  const handleApplyDiscount = () => {
    if (discountInput.toUpperCase() === "MIDSUMMER") {
      setAppliedDiscount({ code: "MIDSUMMER", amount: 10 });
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountInput("");
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <aside className="rounded-[40px] bg-white p-10">
      <h2
        className="text-[24px] font-medium leading-[32px] text-[#3a3532]"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        Order Summary
      </h2>

      <div className="mt-16 space-y-8">
        {items.map((item) => (
          <div key={`${item.productId}-${item.size}`} className="flex gap-5">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-tl-[80px] rounded-tr-[80px] rounded-bl-[8px] rounded-br-[8px]">
              <Image
                src={item.productImage}
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
                {item.size.toUpperCase()} / QTY {item.quantity}
              </p>
              <p
                className="text-[14px] font-medium leading-5 text-[#3a3532]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {formatCurrency(item.price)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 space-y-4">
        <h3
          className="text-[18px] font-medium leading-[28px] text-[#3a3532]"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Discount Code
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={discountInput}
            onChange={(e) => setDiscountInput(e.target.value)}
            placeholder="Discount Code"
            disabled={!!appliedDiscount}
            className="h-11 flex-1 rounded-full bg-white px-6 text-[14px] leading-5 text-[#2c2825] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#8a6d5d] disabled:opacity-50"
            style={{ fontFamily: "var(--font-inter)" }}
          />
          <button
            type="button"
            onClick={handleApplyDiscount}
            disabled={!!appliedDiscount || !discountInput}
            className="h-11 rounded-full bg-white px-6 text-[10px] font-bold leading-[15px] tracking-[2px] text-[#8a6d5d] transition hover:bg-[#f9fafb] disabled:opacity-50"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Apply
          </button>
        </div>

        {appliedDiscount && (
          <div className="flex items-center gap-2 rounded-full bg-[#f2f7f2] px-4 py-2">
            <span
              className="flex-1 text-[10px] font-bold leading-[15px] tracking-[1px] text-[#5a7d5a]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {appliedDiscount.code} - ${appliedDiscount.amount.toFixed(2)}
            </span>
            <button
              type="button"
              onClick={handleRemoveDiscount}
              className="flex h-6 w-6 items-center justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
                  fill="#5a7d5a"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-4 border-t border-[#f3f0ec] pt-8">
        <div className="flex items-center justify-between">
          <span
            className="text-[12px] font-medium leading-4 tracking-[0.3px] text-[#9ca3af]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            SUBTOTAL
          </span>
          <span
            className="text-[12px] font-medium leading-4 tracking-[0.3px] text-[#3a3532]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {formatCurrency(subtotal)}
          </span>
        </div>

        {appliedDiscount && (
          <div className="flex items-center justify-between">
            <span
              className="text-[12px] font-medium leading-4 tracking-[0.3px] text-[#5a7d5a]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              DISCOUNT
            </span>
            <span
              className="text-[12px] font-medium leading-4 tracking-[0.3px] text-[#5a7d5a]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              - {formatCurrency(discount)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span
            className="text-[12px] font-medium leading-4 tracking-[0.3px] text-[#9ca3af]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            DELIVERY
          </span>
          <span
            className="text-[12px] font-bold leading-4 tracking-[0.3px] text-[#d4a373]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            COMPLIMENTARY
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-[#f3f0ec] pt-4">
          <span
            className="text-[18px] font-medium leading-[28px] text-[#3a3532]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Total
          </span>
          <span
            className="text-[18px] font-semibold leading-[28px] text-[#3a3532]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={items.length === 0}
        className="mt-10 flex h-[68px] w-full items-center justify-center gap-2 rounded-full bg-[#8a6d5d] text-[20px] font-medium leading-[28px] tracking-[0.5px] text-white transition hover:bg-[#775f51] disabled:cursor-not-allowed disabled:opacity-50"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        Place Your Order
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
        YOUR ARRANGEMENT WILL BE HAND-CRAFTED AND DELIVERED WITH CARE.
      </p>
    </aside>
  );
}
