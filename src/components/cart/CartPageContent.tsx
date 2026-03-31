"use client";

import { useSyncExternalStore } from "react";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import { CartItem, CartNote, useCartStore } from "@/lib/cart";
import { CartItemsTable } from "./CartItemsTable";
import { CartNoteCard } from "./CartNoteCard";
import { CartRecommendations } from "./CartRecommendations";
import { CartSummary } from "./CartSummary";
import { CART_RECOMMENDATIONS, SHIPPING_FEE } from "./constants";

function subscribeToCartHydration(onStoreChange: () => void) {
  const unsubscribeStart = useCartStore.persist.onHydrate(onStoreChange);
  const unsubscribeFinish =
    useCartStore.persist.onFinishHydration(onStoreChange);

  return () => {
    unsubscribeStart();
    unsubscribeFinish();
  };
}

export function CartPageContent() {
  const hydrated = useSyncExternalStore(
    subscribeToCartHydration,
    () => useCartStore.persist.hasHydrated(),
    () => false
  );
  const items = useCartStore((state) => state.items);
  const note = useCartStore((state) => state.note);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const setNote = useCartStore((state) => state.setNote);
  const clearNote = useCartStore((state) => state.clearNote);

  const displayItems = hydrated ? items : [];
  const hasItems = displayItems.length > 0;
  const subtotal = displayItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = hasItems ? SHIPPING_FEE : 0;
  const total = subtotal + shipping;

  const handleDecrease = (item: CartItem) => {
    updateQuantity(item.productId, item.size, item.quantity - 1);
  };

  const handleIncrease = (item: CartItem) => {
    updateQuantity(item.productId, item.size, item.quantity + 1);
  };

  const handleRemove = (item: CartItem) => {
    removeItem(item.productId, item.size);
  };

  const handleSaveNote = (nextNote: CartNote) => {
    setNote(nextNote);
  };

  return (
    <div className="min-h-screen bg-[var(--color-cart-background)] text-[var(--color-cart-ink)]">
      <Navbar />
      <main>
        <section className="mx-auto max-w-[1280px] px-10 pb-16 pt-16 sm:px-8 lg:px-10 lg:pb-24 lg:pt-16">
          <div className="mx-auto max-w-[1152px]">
            <div className="mb-16 flex flex-col items-center">
              <h1
                className="text-center text-[48px] font-light leading-[48px] text-[var(--color-cart-ink)]"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Your Flower Cart
              </h1>
              <div className="mt-4 h-px w-20 bg-[rgba(201,166,148,0.3)]" />
            </div>
            <div className="grid gap-10 xl:grid-cols-[1fr_380px] xl:gap-20">
              <div className="space-y-10">
                <CartItemsTable
                  isHydrating={!hydrated}
                  items={displayItems}
                  onDecrease={handleDecrease}
                  onIncrease={handleIncrease}
                  onRemove={handleRemove}
                />
                {hasItems ? (
                  <CartNoteCard
                    note={note}
                    onClear={clearNote}
                    onSave={handleSaveNote}
                  />
                ) : null}
              </div>
              <CartSummary
                hasItems={hasItems}
                isHydrating={!hydrated}
                shipping={shipping}
                subtotal={subtotal}
                total={total}
              />
            </div>
            <CartRecommendations recommendations={CART_RECOMMENDATIONS} />
          </div>
        </section>
      </main>
      <Footer />
      <ChatLive />
    </div>
  );
}
