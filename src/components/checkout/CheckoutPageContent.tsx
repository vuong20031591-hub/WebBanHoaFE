"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Footer, Navbar } from "@/components/layout";
import { getUserRewards, isApiError, ordersApi } from "@/lib/api";
import { useCartStore } from "@/lib/cart";
import type { PaymentMethod as PaymentMethodType } from "@/lib/checkout/types";
import { formatCurrency } from "@/lib/currency";
import { useAuth, useLocale } from "@/src/contexts";
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
  const REDEEM_POINT_VALUE_VND = 1000;

  const router = useRouter();
  const { locale } = useLocale();
  const { user, loading: authLoading } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodType>("vietqr");
  const [availablePoints, setAvailablePoints] = useState(0);
  const [redeemPointsInput, setRedeemPointsInput] = useState(0);
  const [hasEditedRedeemPoints, setHasEditedRedeemPoints] = useState(false);
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
  const displayItems = useMemo(() => (hydrated ? items : []), [hydrated, items]);
  const cartSubtotal = useMemo(
    () => displayItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [displayItems]
  );
  const featuredDeliveryDate = displayItems.find((item) => item.deliveryDate)?.deliveryDate;

  const maxRedeemablePoints = useMemo(() => {
    const maxByAmount = Math.floor(cartSubtotal / REDEEM_POINT_VALUE_VND);
    return Math.max(0, Math.min(availablePoints, maxByAmount));
  }, [availablePoints, cartSubtotal]);

  const redeemedPoints = Math.max(0, Math.min(redeemPointsInput, maxRedeemablePoints));
  const rewardsDiscount = redeemedPoints * REDEEM_POINT_VALUE_VND;
  const payableTotal = Math.max(0, cartSubtotal - rewardsDiscount);

  const copy =
    locale === "vi"
      ? {
          heroTitle: "Gan xong roi, bo hoa cua ban dang cho",
          heroSubtitle:
            "Kiem tra thong tin cuoi cung, chon cach thanh toan va chung toi se chuan bi don hang ngay khi duoc xac nhan.",
          signInTitle: "Dang nhap de dat hang",
          signInSubtitle:
            "Quy trinh xac nhan va thanh toan gan voi phien dang nhap tai khoan that.",
          goToSignIn: "Den trang dang nhap",
          deliveryTitle: "Bo hoa giao hang",
          deliveryDescScheduled:
            "Bo hoa ban chon duoc sap lich quanh ngay {date}. Chung toi se giu lich giao dong bo voi xac nhan don hang.",
          deliveryDescDefault:
            "Hoa se duoc chuan bi ngay khi thanh toan xac nhan. Thoi diem giao duoc chot trong qua trinh xu ly de dam bao do tuoi.",
          fulfillmentNote: "Ghi chu xu ly",
          fulfillmentBody:
            "He thong dang su dung truc tiep gio hang va lua chon thanh toan cua ban, sau do tao don tren backend khi ban xac nhan.",
          personalTouch: "Dau an ca nhan",
          personalNote: "Loi nhan ca nhan",
          personalDesc:
            "Loi nhan viet tay se giup don hang gan gui hon. Neu ban da them o gio hang, no se hien thi o day truoc khi thanh toan.",
          noNote: "Chua co loi nhan",
          noNoteDesc:
            "Ban van co the quay lai gio hang de them loi nhan ngan gon cho don qua.",
          editInBag: "Sua loi nhan trong gio",
          rewardsTitle: "Su dung diem Bloom Rewards",
          rewardsDesc:
            "Ap dung diem Bloom Rewards truoc khi dat hang. Day la diem tich luy tai khoan, khong phai ma giam gia. Ty le quy doi: 1 diem = 1,000 VND.",
          rewardsAvailable: "Diem hien co",
          pointsToApply: "Diem ap dung",
          useMax: "Dung toi da",
          clear: "Xoa",
          maxUsable: "Toi da co the dung cho don nay: {points} diem",
          submitError: "Khong the tao don hang luc nay.",
        }
      : {
          heroTitle: "Almost there, your flowers are waiting",
          heroSubtitle:
            "Review the final details, choose how you would like to pay, and we will prepare your order with care the moment it is confirmed.",
          signInTitle: "Sign in to place an order",
          signInSubtitle:
            "Your confirmation and payment flow are tied to a real account session.",
          goToSignIn: "Go to Sign In",
          deliveryTitle: "Delivery Arrangement",
          deliveryDescScheduled:
            "Your selected arrangement is scheduled around {date}. We will keep the delivery timing aligned with your order confirmation.",
          deliveryDescDefault:
            "Your flowers will be prepared as soon as payment is confirmed. Delivery timing is finalized during order processing to keep every bouquet fresh.",
          fulfillmentNote: "Fulfillment note",
          fulfillmentBody:
            "We are currently using your live cart contents and payment selection, then preparing the order directly from the backend once you confirm.",
          personalTouch: "Personal Touch",
          personalNote: "Personal Note",
          personalDesc:
            "A handwritten message keeps the order feeling intimate. If you added one in the cart, it will be reflected here before you complete checkout.",
          noNote: "No note added yet",
          noNoteDesc:
            "You can still return to the bag and add a short message if this order is meant to feel more personal.",
          editInBag: "Edit message in bag",
          rewardsTitle: "Use Bloom Rewards Points",
          rewardsDesc:
            "Apply your Bloom Rewards points before placing the order. These are loyalty points from your account, not a promo code. Redemption value: 1 point = 1,000 VND.",
          rewardsAvailable: "Reward points available",
          pointsToApply: "Points to apply",
          useMax: "Use max points",
          clear: "Clear",
          maxUsable: "Max usable on this order: {points} points",
          submitError: "Unable to create order right now.",
        };

  useEffect(() => {
    if (!user) {
      setAvailablePoints(0);
      setRedeemPointsInput(0);
      setHasEditedRedeemPoints(false);
      return;
    }

    let active = true;

    const loadRewards = async () => {
      try {
        const rewards = await getUserRewards();
        if (!active) {
          return;
        }
        setAvailablePoints(rewards.points);
      } catch {
        if (!active) {
          return;
        }
        setAvailablePoints(0);
      }
    };

    loadRewards();

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!hasEditedRedeemPoints) {
      setRedeemPointsInput(maxRedeemablePoints);
      return;
    }

    if (redeemPointsInput > maxRedeemablePoints) {
      setRedeemPointsInput(maxRedeemablePoints);
    }
  }, [hasEditedRedeemPoints, maxRedeemablePoints, redeemPointsInput]);

  const handlePlaceOrder = async () => {
    if (!user) {
      router.push("/signin");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const order = await ordersApi.createFromCart({
        paymentMethod: selectedPaymentMethod === "cod" ? "COD" : "VIETQR",
        redeemPoints: redeemedPoints > 0 ? redeemedPoints : undefined,
      });

      clearCart();

      if (payableTotal <= 0) {
        router.push(`/checkout/complete?orderId=${order.id}`);
        return;
      }

      if (selectedPaymentMethod === "vietqr") {
        router.push(`/checkout/qr?orderId=${order.id}`);
        return;
      }

      router.push(`/checkout/complete?orderId=${order.id}`);
    } catch (error) {
      setSubmitError(
        isApiError(error) ? error.message : copy.submitError
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
              {copy.heroTitle}
            </h1>
            <p className="mt-5 max-w-[620px] text-[15px] leading-7 text-[#9b8a7f]">
              {copy.heroSubtitle}
            </p>
          </div>

          {!authLoading && !user ? (
            <div className="rounded-[40px] bg-white p-10 text-center shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
              <h2
                className="text-[30px] font-medium leading-[38px] text-[#2c2825]"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                  {copy.signInTitle}
              </h2>
              <p className="mt-4 text-[14px] leading-6 text-[#7c6d64]">
                  {copy.signInSubtitle}
              </p>
              <Link
                href="/signin"
                className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#a88672] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#916f5b]"
              >
                  {copy.goToSignIn}
              </Link>
            </div>
          ) : (
            <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
              <div className="space-y-8">
                <CheckoutCard
                    eyebrow={locale === "vi" ? "Giao hang" : "Delivery"}
                    title={copy.deliveryTitle}
                  description={
                    featuredDeliveryDate
                        ? copy.deliveryDescScheduled.replace("{date}", featuredDeliveryDate)
                        : copy.deliveryDescDefault
                  }
                >
                  <div className="rounded-[26px] bg-[#fcf7f2] px-6 py-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ccb1a0]">
                        {copy.fulfillmentNote}
                    </p>
                    <p className="mt-3 text-[14px] leading-7 text-[#8f7e73]">
                        {copy.fulfillmentBody}
                    </p>
                  </div>
                </CheckoutCard>

                <CheckoutCard
                    eyebrow={copy.personalTouch}
                    title={copy.personalNote}
                    description={copy.personalDesc}
                >
                  <div className="overflow-hidden rounded-[32px] border border-[rgba(185,158,140,0.14)] bg-[linear-gradient(180deg,#fffdfa_0%,#fffcf8_100%)] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:px-8 sm:py-8">
                    {note?.message ? (
                      <div className="flex min-h-[220px] flex-col">
                        <p
                          className="max-w-full whitespace-pre-line text-[34px] leading-[1.28] text-[#5f5047] sm:max-w-[88%] sm:text-[48px]"
                          style={{
                            fontFamily: "var(--font-script)",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {note.message}
                        </p>
                        {note.signature ? (
                          <div className="mt-auto flex justify-end pt-8">
                            <p
                              className="max-w-full text-right text-[30px] leading-none text-[#baa295] sm:max-w-[45%] sm:text-[42px]"
                              style={{
                                fontFamily: "var(--font-script)",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {note.signature}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div>
                        <p
                          className="text-[28px] leading-none text-[#56463f]"
                          style={{ fontFamily: "var(--font-cormorant)" }}
                        >
                          {copy.noNote}
                        </p>
                        <p className="mt-4 max-w-[520px] text-[14px] leading-7 text-[#8f7e73]">
                          {copy.noNoteDesc}
                        </p>
                        <Link
                          href="/cart"
                          className="mt-6 inline-flex border-b border-[rgba(185,158,140,0.35)] pb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6f5c50] transition-colors hover:text-[#a88672]"
                        >
                          {copy.editInBag}
                        </Link>
                      </div>
                    )}
                  </div>
                </CheckoutCard>

                <CheckoutCard
                  eyebrow="Bloom Rewards"
                  title={copy.rewardsTitle}
                  description={copy.rewardsDesc}
                >
                  <div className="rounded-[26px] bg-[#fcf7f2] px-6 py-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ccb1a0]">
                      {copy.rewardsAvailable}
                    </p>
                    <p className="mt-2 text-[22px] leading-none text-[#5e4f46]" style={{ fontFamily: "var(--font-cormorant)" }}>
                      {availablePoints}
                    </p>
                    <label className="mt-5 block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8f7e73]">
                      {copy.pointsToApply}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={maxRedeemablePoints}
                      value={redeemPointsInput}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setHasEditedRedeemPoints(true);
                        setRedeemPointsInput(Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0);
                      }}
                      className="mt-2 h-11 w-full rounded-[12px] border border-[rgba(185,158,140,0.25)] bg-white px-4 text-[14px] text-[#5b4a41] outline-none focus:border-[#c9ab8f]"
                    />
                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setHasEditedRedeemPoints(true);
                          setRedeemPointsInput(maxRedeemablePoints);
                        }}
                        className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-[rgba(169,134,114,0.22)] bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7d6657] transition-colors hover:border-[#c9ab8f] hover:text-[#5b4a41]"
                      >
                        {copy.useMax}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setHasEditedRedeemPoints(true);
                          setRedeemPointsInput(0);
                        }}
                        className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-[rgba(185,158,140,0.18)] bg-transparent px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9c8b80] transition-colors hover:border-[rgba(169,134,114,0.22)] hover:text-[#6f5c50]"
                      >
                        {copy.clear}
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[13px] text-[#8f7e73]">
                      <span>{copy.maxUsable.replace("{points}", String(maxRedeemablePoints))}</span>
                      <span className="font-medium text-[#166534]">-{formatCurrency(rewardsDiscount, locale)}</span>
                    </div>
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
                  redeemedPoints={redeemedPoints}
                  rewardsDiscount={rewardsDiscount}
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
