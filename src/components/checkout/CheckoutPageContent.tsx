"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import { useCartStore } from "@/lib/cart";
import { Breadcrumb } from "./Breadcrumb";
import { DeliveryForm } from "./DeliveryForm";
import { PersonalNote } from "./PersonalNote";
import { PaymentMethod } from "./PaymentMethod";
import { OrderSummary } from "./OrderSummary";

function subscribeToCartHydration(onStoreChange: () => void) {
  const unsubscribeStart = useCartStore.persist.onHydrate(onStoreChange);
  const unsubscribeFinish = useCartStore.persist.onFinishHydration(onStoreChange);

  return () => {
    unsubscribeStart();
    unsubscribeFinish();
  };
}

export function CheckoutPageContent() {
  const router = useRouter();
  
  const hydrated = useSyncExternalStore(
    subscribeToCartHydration,
    () => useCartStore.persist.hasHydrated(),
    () => false
  );

  const items = useCartStore((state) => state.items);
  const displayItems = hydrated ? items : [];

  const handlePlaceOrder = () => {
    console.log("Order placed");
  };

  return (
    <div className="min-h-screen bg-[#fcfaf6]">
      <Navbar />
      
      <main className="mx-auto max-w-[1280px] px-10 py-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-12">
            <Breadcrumb currentStep="details" />
          </div>

          <div className="mb-20">
            <h1
              className="text-[48px] font-light leading-[48px] text-[#2c2825]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Almost there, your flowers are waiting
            </h1>
            <p
              className="mt-4 text-[14px] font-light leading-5 tracking-[0.35px] text-[#9ca3af]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Finishing your order to bring natural elegance to your doorstep.
            </p>
          </div>

          <div className="grid gap-16 xl:grid-cols-[580px_1fr]">
            <div className="space-y-16">
              <DeliveryForm />
              <PersonalNote />
              <PaymentMethod />
            </div>

            <div>
              <OrderSummary items={displayItems} onPlaceOrder={handlePlaceOrder} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ChatLive />
    </div>
  );
}
