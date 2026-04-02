"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import { isApiError, ordersApi } from "@/lib/api";
import { useCartStore } from "@/lib/cart";
import type { PaymentMethod as PaymentMethodType } from "@/lib/checkout/types";
import { useAuth } from "@/src/contexts";
import { Breadcrumb } from "./Breadcrumb";
import { OrderSummary } from "./OrderSummary";
import { PaymentMethod } from "./PaymentMethod";

function subscribeToCartHydration(onStoreChange: () => void) {
  const unsubscribeStart = useCartStore.persist.onHydrate(onStoreChange);
  const unsubscribeFinish = useCartStore.persist.onFinishHydration(onStoreChange);

  return () => {
    unsubscribeStart();
    unsubscribeFinish();
  };
}

function UnavailableBlock({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-[40px] border border-[rgba(92,107,94,0.12)] bg-white/60 px-8 py-8">
      <h2
        className="text-[24px] font-medium leading-[32px] text-[#2c2825]"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        {title}
      </h2>
      <p
        className="mt-4 text-[14px] font-light leading-6 text-[#5c6b5e]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {description}
      </p>
    </section>
  );
}

export function CheckoutPageContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodType>("qr");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hydrated = useSyncExternalStore(
    subscribeToCartHydration,
    () => useCartStore.persist.hasHydrated(),
    () => false
  );

  const items = useCartStore((state) => state.variants);
  const clearCart = useCartStore((state) => state.clearCart);
  const displayItems = hydrated ? items : [];

  const handlePlaceOrder = async () => {
    if (!user) {
      router.push("/signin");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const order = await ordersApi.createFromCart({
        paymentMethod: selectedPaymentMethod === "qr" ? "VIETQR" : "COD",
      });

      clearCart();

      if (selectedPaymentMethod === "qr") {
        router.push(`/checkout/qr?orderId=${order.id}`);
        return;
      }

      router.push(`/checkout/complete?orderId=${order.id}`);
    } catch (error) {
      setSubmitError(
        isApiError(error)
          ? error.message
          : "Unable to create order right now."
      );
    } finally {
      setIsSubmitting(false);
    }
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
              This checkout now creates a real backend order from your current
              cart.
            </p>
          </div>

          {!authLoading && !user ? (
            <div className="rounded-[40px] bg-white p-10 text-center">
              <h2
                className="text-[30px] font-medium leading-[38px] text-[#2c2825]"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Sign in to place an order
              </h2>
              <p
                className="mt-4 text-[14px] leading-6 text-[#5c6b5e]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Order and payment APIs require an authenticated user session.
              </p>
              <Link
                href="/signin"
                className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#d0bb95] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571]"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <div className="grid gap-16 xl:grid-cols-[580px_1fr]">
              <div className="space-y-8">
                <UnavailableBlock
                  title="Delivery Details"
                  description="The backend does not expose a public address API for the frontend yet, so delivery details cannot use real persisted data in this scope."
                />
                <UnavailableBlock
                  title="Personal Note"
                  description="The backend order API does not store personal notes yet. This section is hidden from the real checkout flow to avoid any local mock state."
                />
                <PaymentMethod
                  value={selectedPaymentMethod}
                  onSelect={setSelectedPaymentMethod}
                />
                {submitError ? (
                  <div className="rounded-[24px] border border-[rgba(163,43,43,0.18)] bg-[rgba(163,43,43,0.06)] px-6 py-5 text-[14px] leading-6 text-[#8b2d2d]">
                    {submitError}
                  </div>
                ) : null}
              </div>

              <div>
                <OrderSummary
                  items={displayItems}
                  onPlaceOrder={handlePlaceOrder}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <ChatLive />
    </div>
  );
}
