"use client";

import { useSyncExternalStore } from "react";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import { useCartStore } from "@/lib/cart";
import { CompleteGiftSummary } from "./CompleteGiftSummary";
import { CompleteHero } from "./CompleteHero";
import { CompletePersonalTouch } from "./CompletePersonalTouch";
import { CompleteSidebar } from "./CompleteSidebar";
import { getCompleteOrderNumber } from "./complete.constants";

function subscribeToCartHydration(onStoreChange: () => void) {
  const unsubscribeStart = useCartStore.persist.onHydrate(onStoreChange);
  const unsubscribeFinish = useCartStore.persist.onFinishHydration(onStoreChange);

  return () => {
    unsubscribeStart();
    unsubscribeFinish();
  };
}

export function CompletePageContent() {
  const hydrated = useSyncExternalStore(
    subscribeToCartHydration,
    () => useCartStore.persist.hasHydrated(),
    () => false
  );

  const items = useCartStore((state) => state.items);
  const note = useCartStore((state) => state.note);
  const displayItems = hydrated ? items : [];
  const total = displayItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const orderNumber = getCompleteOrderNumber(displayItems);

  return (
    <div className="min-h-screen bg-[#fdfaf7]">
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-10 pb-24 pt-16 sm:px-8 lg:px-10 lg:pt-20">
        <div className="mx-auto max-w-[1040px]">
          <CompleteHero
            hasItems={displayItems.length > 0}
            isHydrating={!hydrated}
            orderNumber={orderNumber}
          />
          <div className="mt-20 grid gap-16 xl:grid-cols-[580px_396px] xl:items-start xl:justify-between">
            <div className="space-y-16">
              <CompleteGiftSummary
                isHydrating={!hydrated}
                items={displayItems}
              />
              <CompletePersonalTouch items={displayItems} note={note} />
            </div>
            <CompleteSidebar
              hasItems={displayItems.length > 0}
              total={total}
            />
          </div>
        </div>
      </main>
      <Footer />
      <ChatLive />
    </div>
  );
}
