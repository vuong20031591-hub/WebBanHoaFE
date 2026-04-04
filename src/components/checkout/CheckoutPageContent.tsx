"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Footer, Navbar } from "@/components/layout";
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

function CheckoutCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-[36px] border border-[rgba(185,158,140,0.14)] bg-white px-8 py-8 shadow-[0_20px_55px_rgba(148,117,99,0.06)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d0b59c]">
        {eyebrow}
      </p>
      <h2
        className="mt-4 text-[34px] leading-none text-[#4a3b34]"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        {title}
      </h2>
      <p className="mt-4 max-w-[560px] text-[14px] leading-7 text-[#907e73]">
        {description}
      </p>
      {children ? <div className="mt-7">{children}</div> : null}
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
  const note = useCartStore((state) => state.note);
  const clearCart = useCartStore((state) => state.clearCart);
  const displayItems = hydrated ? items : [];
  const featuredDeliveryDate = displayItems.find((item) => item.deliveryDate)?.deliveryDate;

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
        isApiError(error) ? error.message : "Unable to create order right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#f9f2eb_55%,#fffdfb_100%)]">
      <Navbar />

      <main className="mx-auto max-w-[1280px] px-6 pb-24 pt-14 sm:px-8 lg:px-10 lg:pt-16">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-10">
            <Breadcrumb currentStep="details" />
          </div>

          <div className="mb-14 max-w-[760px]">
            <h1
              className="text-[48px] font-light leading-none text-[#4a3b34] sm:text-[64px]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Almost there, your flowers are waiting
            </h1>
            <p className="mt-5 max-w-[620px] text-[15px] leading-7 text-[#9b8a7f]">
              Review the final details, choose how you would like to pay, and we will
              prepare your order with care the moment it is confirmed.
            </p>
          </div>

          {!authLoading && !user ? (
            <div className="rounded-[40px] bg-white p-10 text-center shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
              <h2
                className="text-[30px] font-medium leading-[38px] text-[#2c2825]"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Sign in to place an order
              </h2>
              <p className="mt-4 text-[14px] leading-6 text-[#7c6d64]">
                Your confirmation and payment flow are tied to a real account session.
              </p>
              <Link
                href="/signin"
                className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#a88672] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#916f5b]"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
              <div className="space-y-8">
                <CheckoutCard
                  eyebrow="Delivery"
                  title="Delivery Arrangement"
                  description={
                    featuredDeliveryDate
                      ? `Your selected arrangement is scheduled around ${featuredDeliveryDate}. We will keep the delivery timing aligned with your order confirmation.`
                      : "Your flowers will be prepared as soon as payment is confirmed. Delivery timing is finalized during order processing to keep every bouquet fresh."
                  }
                >
                  <div className="rounded-[26px] bg-[#fcf7f2] px-6 py-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ccb1a0]">
                      Fulfillment note
                    </p>
                    <p className="mt-3 text-[14px] leading-7 text-[#8f7e73]">
                      We are currently using your live cart contents and payment selection,
                      then preparing the order directly from the backend once you confirm.
                    </p>
                  </div>
                </CheckoutCard>

                <CheckoutCard
                  eyebrow="Personal Touch"
                  title="Personal Note"
                  description="A handwritten message keeps the order feeling intimate. If you added one in the cart, it will be reflected here before you complete checkout."
                >
                  <div className="rounded-[30px] border border-[rgba(185,158,140,0.14)] bg-[#fffdfa] px-6 py-6">
                    {note?.message ? (
                      <>
                        <p
                          className="whitespace-pre-line text-[30px] leading-[1.35] text-[#6a584e]"
                          style={{ fontFamily: "var(--font-cormorant)" }}
                        >
                          {note.message}
                        </p>
                        {note.signature ? (
                          <p
                            className="mt-4 text-right text-[18px] italic text-[#b39f92]"
                            style={{ fontFamily: "var(--font-cormorant)" }}
                          >
                            {note.signature}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <div>
                        <p
                          className="text-[28px] leading-none text-[#56463f]"
                          style={{ fontFamily: "var(--font-cormorant)" }}
                        >
                          No note added yet
                        </p>
                        <p className="mt-4 max-w-[520px] text-[14px] leading-7 text-[#8f7e73]">
                          You can still return to the bag and add a short message if this
                          order is meant to feel more personal.
                        </p>
                        <Link
                          href="/cart"
                          className="mt-6 inline-flex border-b border-[rgba(185,158,140,0.35)] pb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6f5c50] transition-colors hover:text-[#a88672]"
                        >
                          Edit message in bag
                        </Link>
                      </div>
                    )}
                  </div>
                </CheckoutCard>

                <div className="rounded-[36px] border border-[rgba(185,158,140,0.14)] bg-white px-8 py-8 shadow-[0_20px_55px_rgba(148,117,99,0.06)]">
                  <PaymentMethod
                    value={selectedPaymentMethod}
                    onSelect={setSelectedPaymentMethod}
                  />
                </div>

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
    </div>
  );
}
