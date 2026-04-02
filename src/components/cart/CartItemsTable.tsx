"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, AlertCircle, RefreshCw } from "lucide-react";
import { CartItem, useCartStore } from "@/lib/cart";
import { formatCurrency } from "@/lib/currency";
import { getCartItemVariant } from "./constants";

interface CartItemsTableProps {
  isHydrating: boolean;
  items: CartItem[];
  onDecrease: (item: CartItem) => void;
  onIncrease: (item: CartItem) => void;
  onRemove: (item: CartItem) => void;
  onRetry?: (productId: number) => void;
}

function LoadingRows() {
  return (
    <div className="animate-pulse">
      {[0, 1].map((row) => (
        <div
          key={row}
          className="grid gap-5 border-b border-[rgba(229,225,218,0.5)] py-8 last:border-b-0 md:grid-cols-[1fr_128px_110px] md:items-center"
        >
          <div className="flex gap-8">
            <div className="h-32 w-24 rounded-tl-[80px] rounded-tr-[80px] rounded-bl-[8px] rounded-br-[8px] bg-[rgba(138,109,93,0.12)]" />
            <div className="flex flex-1 flex-col justify-center gap-3">
              <div className="h-6 w-40 rounded-full bg-[rgba(138,109,93,0.12)]" />
              <div className="h-4 w-28 rounded-full bg-[rgba(138,109,93,0.08)]" />
            </div>
          </div>
          <div className="h-12 rounded-full bg-[rgba(138,109,93,0.12)]" />
          <div className="flex flex-col gap-3">
            <div className="h-5 rounded-full bg-[rgba(138,109,93,0.12)]" />
            <div className="h-4 rounded-full bg-[rgba(138,109,93,0.08)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CartItemsTable({
  isHydrating,
  items,
  onDecrease,
  onIncrease,
  onRemove,
  onRetry,
}: CartItemsTableProps) {
  const getSyncEntry = useCartStore((state) => state.getSyncEntry);

  return (
    <section className="overflow-hidden bg-transparent">
      <div className="hidden border-b border-[#e5e1da] pb-6 md:grid md:grid-cols-[1fr_128px_110px] md:gap-6">
        <p
          className="pl-1 text-[18px] leading-[28px] text-[var(--color-cart-ink)]"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Selected Blooms
        </p>
        <p
          className="text-center text-[18px] leading-[28px] text-[var(--color-cart-ink)]"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Quantity
        </p>
        <p
          className="text-right text-[18px] leading-[28px] text-[var(--color-cart-ink)]"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Total
        </p>
      </div>
      <div className="pt-0 md:pt-0">
        {isHydrating ? (
          <LoadingRows />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-5 border border-dashed border-[rgba(201,166,148,0.45)] bg-[rgba(253,251,247,0.8)] px-6 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(201,166,148,0.14)] text-[var(--color-cart-warm)]">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2
                className="text-[32px] leading-none text-[var(--color-cart-ink)]"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Your cart is resting
              </h2>
              <p
                className="mx-auto max-w-md text-[14px] leading-7 text-[rgba(58,53,50,0.65)]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Add a few arrangements to bring this editorial cart layout to
                life.
              </p>
            </div>
            <Link
              href="/products"
              className="rounded-full border border-[rgba(201,166,148,0.45)] px-6 py-3 text-[11px] uppercase tracking-[1.8px] text-[var(--color-cart-ink)] transition hover:bg-[rgba(201,166,148,0.08)]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Explore Blooms
            </Link>
          </div>
        ) : (
          <div>
            {items.map((item, index) => {
              const syncEntry = getSyncEntry(item.productId);
              const syncStatus = syncEntry?.syncStatus;
              const hasError = syncStatus === "error";

              return (
              <article
                key={item.localId}
                className={`grid gap-6 py-8 md:grid-cols-[1fr_128px_110px] md:items-center ${
                  index < items.length - 1 ? "border-b border-[rgba(229,225,218,0.5)]" : ""
                }`}
              >
                <div className="flex gap-4 pl-1 sm:gap-8">
                  <div className="relative h-32 w-24 overflow-hidden rounded-tl-[80px] rounded-tr-[80px] rounded-bl-[8px] rounded-br-[8px] bg-white">
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                    <h3
                      className="text-[20px] leading-[28px] text-[var(--color-cart-ink)]"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {item.productName}
                    </h3>
                    <p
                      className="text-[10px] uppercase tracking-[1.5px] text-[rgba(138,109,93,0.7)]"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {getCartItemVariant(item)}
                    </p>
                    {hasError && (
                      <div className="flex items-center gap-2 mt-1">
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span className="text-[10px] text-red-500" style={{ fontFamily: "var(--font-inter)" }}>
                          Sync failed
                        </span>
                        {onRetry && (
                          <button
                            type="button"
                            onClick={() => onRetry(item.productId)}
                            className="text-[9px] uppercase tracking-[0.9px] text-[var(--color-cart-gold)] hover:text-[var(--color-cart-warm)] flex items-center gap-1"
                            style={{ fontFamily: "var(--font-inter)" }}
                          >
                            <RefreshCw className="h-3 w-3" />
                            Retry
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 md:justify-center">
                  <span
                    className="text-[10px] uppercase tracking-[1.5px] text-[rgba(138,109,93,0.6)] md:hidden"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Quantity
                  </span>
                  <div className="inline-flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => onDecrease(item)}
                      className="text-[var(--color-cart-ink)] transition hover:text-[var(--color-cart-gold)]"
                      aria-label={`Decrease quantity for ${item.productName}`}
                    >
                      <Minus className="h-[9px] w-[9px]" strokeWidth={0.75} />
                    </button>
                    <span
                      className="min-w-[6px] text-center text-[14px] font-light leading-[20px] text-[var(--color-cart-ink)]"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onIncrease(item)}
                      className="text-[var(--color-cart-ink)] transition hover:text-[var(--color-cart-gold)]"
                      aria-label={`Increase quantity for ${item.productName}`}
                    >
                      <Plus className="h-[9px] w-[9px]" strokeWidth={1} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:gap-3 md:pr-1">
                  <span
                    className="text-[10px] uppercase tracking-[1.5px] text-[rgba(138,109,93,0.6)] md:hidden"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Total
                  </span>
                  <p
                    className="text-[14px] font-medium leading-[20px] tracking-[0.35px] text-[var(--color-cart-ink)]"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onRemove(item)}
                    className="text-[9px] uppercase tracking-[0.9px] text-[var(--color-cart-gold)] transition hover:text-[var(--color-cart-warm)]"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Remove
                  </button>
                </div>
              </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
