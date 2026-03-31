"use client";

import { useSyncExternalStore } from "react";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import { useCartStore } from "@/lib/cart";
import { getTrackingOrderMeta } from "./tracking.constants";
import { TrackingHero } from "./TrackingHero";
import { TrackingHighlights } from "./TrackingHighlights";
import { TrackingMapSection } from "./TrackingMapSection";
import { TrackingTimeline } from "./TrackingTimeline";

function subscribeToCartHydration(onStoreChange: () => void) {
  const unsubscribeStart = useCartStore.persist.onHydrate(onStoreChange);
  const unsubscribeFinish = useCartStore.persist.onFinishHydration(onStoreChange);

  return () => {
    unsubscribeStart();
    unsubscribeFinish();
  };
}

export function TrackingPageContent() {
  const hydrated = useSyncExternalStore(
    subscribeToCartHydration,
    () => useCartStore.persist.hasHydrated(),
    () => false
  );

  const items = useCartStore((state) => state.items);
  const displayItems = hydrated ? items : [];
  const orderMeta = getTrackingOrderMeta(displayItems);

  return (
    <div className="min-h-screen bg-[#fdfaf7]">
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-10 pb-24 pt-16 sm:px-8 lg:px-10 lg:pt-20">
        <div className="mx-auto max-w-[1200px]">
          <TrackingHero orderMeta={orderMeta} />
          <div className="mt-16 grid gap-14 xl:grid-cols-[396px_580px] xl:items-start xl:justify-between">
            <TrackingTimeline />
            <TrackingMapSection />
          </div>
          <div className="mt-20">
            <TrackingHighlights />
          </div>
        </div>
      </main>
      <Footer />
      <ChatLive />
    </div>
  );
}
