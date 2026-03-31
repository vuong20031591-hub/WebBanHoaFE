"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import { useCartStore } from "@/lib/cart";
import { QrPaymentCodeCard } from "./QrPaymentCodeCard";
import { QrPaymentSteps } from "./QrPaymentSteps";
import { QrPaymentSummary } from "./QrPaymentSummary";
import {
  QR_PAYMENT_COPY,
  QR_PAYMENT_INITIAL_SECONDS,
} from "./qr.constants";

function subscribeToCartHydration(onStoreChange: () => void) {
  const unsubscribeStart = useCartStore.persist.onHydrate(onStoreChange);
  const unsubscribeFinish = useCartStore.persist.onFinishHydration(onStoreChange);

  return () => {
    unsubscribeStart();
    unsubscribeFinish();
  };
}

export function QrPaymentPageContent() {
  const hydrated = useSyncExternalStore(
    subscribeToCartHydration,
    () => useCartStore.persist.hasHydrated(),
    () => false
  );
  const [remainingSeconds, setRemainingSeconds] = useState(
    QR_PAYMENT_INITIAL_SECONDS
  );

  const items = useCartStore((state) => state.items);
  const displayItems = hydrated ? items : [];
  const total = displayItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRemainingSeconds((currentValue) =>
        currentValue === 0 ? 0 : currentValue - 1
      );
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfaf7]">
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-10 pb-20 pt-16 sm:px-8 lg:px-10 lg:pt-24">
        <div className="mx-auto max-w-[1000px]">
          <header className="mx-auto max-w-[410px] text-center">
            <h1
              className="text-[42px] font-light leading-[1] text-[#2c2825] md:text-[48px]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {QR_PAYMENT_COPY.headerTitle}
            </h1>
            <p
              className="mt-4 text-[10px] font-light uppercase leading-[15px] tracking-[1.5px] text-[#9ca3af]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              {QR_PAYMENT_COPY.headerSubtitle}
            </p>
          </header>

          <div className="mt-14 grid gap-10 lg:grid-cols-[214px_minmax(0,460px)_214px] lg:items-center lg:gap-8">
            <div className="order-2 lg:order-1">
              <QrPaymentSteps />
            </div>
            <div className="order-1 lg:order-2">
              <QrPaymentCodeCard remainingSeconds={remainingSeconds} />
            </div>
            <div className="order-3 lg:order-3">
              <QrPaymentSummary
                isHydrating={!hydrated}
                items={displayItems}
                total={total}
              />
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/checkout"
              className="text-[10px] font-semibold uppercase leading-[15px] tracking-[2px] text-[#9ca3af] transition hover:text-[#8a6d5d]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              {QR_PAYMENT_COPY.cancelLabel}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <ChatLive />
    </div>
  );
}
