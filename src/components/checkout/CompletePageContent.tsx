"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BadgeCheck, Quote, ReceiptText, Sparkles, Truck } from "lucide-react";
import { Footer, Navbar } from "@/components/layout";
import { formatCurrency } from "@/lib/currency";
import { isApiError, ordersApi } from "@/lib/api";
import {
  formatOrderDate,
  formatOrderStatus,
  formatPaymentMethod,
  loadOrderProducts,
  mapOrderItemToDisplay,
  OrderDisplayItem,
} from "@/lib/mappers";
import { OrderDTO } from "@/lib/api/types";
import { useAuth, useLocale } from "@/src/contexts";

function StateCard({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[36px] border border-[rgba(170,144,125,0.14)] bg-white px-8 py-12 text-center shadow-[0_24px_60px_rgba(138,109,93,0.08)] sm:px-10">
      <h2
        className="text-[34px] font-medium leading-none text-[#3e342d]"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-[520px] text-[14px] leading-7 text-[#7a6a5f]">
        {description}
      </p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}

function buildThankYouNote(items: OrderDisplayItem[], locale: "en" | "vi"): string {
  const firstItem = items[0]?.productName ?? (locale === "vi" ? "nhung bo hoa nay" : "these blooms");

  if (locale === "vi") {
    return `Mong ${firstItem.toLowerCase()} mang den su am ap va ve dep cho khong gian cua ban. Cam on ban da tin tuong Floral Boutique trong khoanh khac dac biet nay.`;
  }

  return `May ${firstItem.toLowerCase()} bring warmth and beauty to your space. Thank you for trusting Floral Boutique to prepare something memorable for this moment.`;
}

function calculateEarnedPoints(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  return Math.floor(amount / 1000);
}

export function CompletePageContent() {
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [items, setItems] = useState<OrderDisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orderId = Number(searchParams.get("orderId") || "0");
  const copy =
    locale === "vi"
      ? {
          signInTitle: "Dang nhap de xem don hang",
          signInDesc: "Xac nhan don hang su dung du lieu backend thuc va can phien dang nhap hop le.",
          goToSignIn: "Den trang dang nhap",
          loadError: "Khong the tai don hang",
          noRecentOrder: "Khong tim thay don gan day",
          noRecentOrderDesc: "Hay dat hang tu gio hang de xem trang xac nhan don thuc te tai day.",
          continueShopping: "Tiep tuc mua sam",
          heroTitle: "Cam on ban da chon su tinh te",
          heroSubtitle: "Don hang #{id} cua ban da duoc ghi nhan va dang duoc chuan bi can than.",
          giftSummary: "Tom tat mon qua cua ban",
          itemsOrdered: "{count} san pham",
          premiumBox: "Hop cao cap",
          pointsUnit: "diem",
          quantity: "So luong",
          personalTouch: "Dau an ca nhan",
          dearBloom: "Gui ban yeu hoa,",
          foreverYours: "Than ai",
          paymentMethod: "Phuong thuc thanh toan",
          whatsNext: "Tiep theo la gi?",
          whatsNextDesc:
            "Cac nghe nhan hoa cua chung toi dang thuc hien bo hoa cua ban. Chung toi se tiep tuc cap nhat trang thai don va giao hang.",
          orderStatus: "Trang thai don hang",
          totalPaid: "Tong da thanh toan",
          confirmedOn: "Da xac nhan vao {date} voi xac thuc thanh toan an toan.",
          rewardsTitle: "Bloom Rewards",
          pointsEarned: "Diem nhan duoc tu don nay",
          pointsRedeemed: "Diem da dung cho don nay",
          rewardsDiscount: "Giam gia tu diem",
          rewardsFormula:
            "Cong thuc hien tai: moi 1,000 VND thanh toan se duoc 1 diem, va moi 1 diem giam 1,000 VND cho don tiep theo.",
          tracking: "Theo doi don hang",
          deliveryUpdate: "Cap nhat giao hang",
          deliveryUpdateDesc:
            "Chung toi se tiep tuc dong bo trang thai backend tu xac nhan den giao hang.",
        }
      : {
          signInTitle: "Sign in to view your order",
          signInDesc: "Order confirmation uses real backend data and requires an authenticated session.",
          goToSignIn: "Go to Sign In",
          loadError: "Unable to load order",
          noRecentOrder: "No recent order found",
          noRecentOrderDesc: "Place an order from your cart to see the real confirmation summary here.",
          continueShopping: "Continue Shopping",
          heroTitle: "Thank you for choosing elegance",
          heroSubtitle: "Your order #{id} has been received and is now being prepared with thoughtful care.",
          giftSummary: "Summary of your gift",
          itemsOrdered: "{count} items ordered",
          premiumBox: "Premium box",
          pointsUnit: "pts",
          quantity: "Quantity",
          personalTouch: "A Personal Touch",
          dearBloom: "Dear Bloom Lover,",
          foreverYours: "Forever Yours",
          paymentMethod: "Payment Method",
          whatsNext: "What's next?",
          whatsNextDesc:
            "Our florists are now hand-crafting your arrangement. We'll keep monitoring the order status and delivery progress for you.",
          orderStatus: "Order Status",
          totalPaid: "Total Paid",
          confirmedOn: "Confirmed on {date} with secure payment verification.",
          rewardsTitle: "Bloom Rewards",
          pointsEarned: "Points earned from this payment",
          pointsRedeemed: "Points redeemed on this order",
          rewardsDiscount: "Discount from rewards",
          rewardsFormula:
            "Formula in the current system: every 1,000 VND paid earns 1 point, and every 1 point can be used as 1,000 VND off on a future order.",
          tracking: "Order Tracking",
          deliveryUpdate: "Delivery Update",
          deliveryUpdateDesc:
            "We'll keep this order refreshed with real backend status as it moves from confirmation to delivery.",
        };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setIsLoading(false);
      setOrder(null);
      setItems([]);
      return;
    }

    let active = true;

    const loadOrder = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const nextOrder =
          orderId > 0 ? await ordersApi.getById(orderId) : await ordersApi.getLatest();
        const productsById = await loadOrderProducts(
          nextOrder.items.map((item) => item.productId)
        );

        if (!active) {
          return;
        }

        setOrder(nextOrder);
        setItems(
          nextOrder.items.map((item) => mapOrderItemToDisplay(item, productsById[item.productId]))
        );
      } catch (fetchError) {
        if (!active) {
          return;
        }

        setOrder(null);
        setItems([]);
        setError(
          isApiError(fetchError) && fetchError.status !== 404
            ? fetchError.message
            : null
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      active = false;
    };
  }, [authLoading, orderId, user]);

  const featuredItems = items.slice(0, 2);
  const thankYouNote = buildThankYouNote(items, locale);
  const earnedPoints = calculateEarnedPoints(order?.totalAmount ?? 0);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#f9f2eb_52%,#fffdfb_100%)] text-[#3e342d]">
      <Navbar />
      <main className="px-6 pb-24 pt-12 sm:px-8 lg:px-10 lg:pt-16">
        <div className="mx-auto max-w-[1220px]">
          {authLoading || isLoading ? (
            <div className="mx-auto h-[760px] max-w-[1100px] rounded-[40px] bg-white/70 animate-pulse" />
          ) : !user ? (
            <div className="mx-auto max-w-[760px]">
              <StateCard
                title={copy.signInTitle}
                description={copy.signInDesc}
                action={
                  <Link
                    href="/signin"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#a88672] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#916f5b]"
                  >
                    {copy.goToSignIn}
                  </Link>
                }
              />
            </div>
          ) : !order ? (
            <div className="mx-auto max-w-[760px]">
              <StateCard
                title={error ? copy.loadError : copy.noRecentOrder}
                description={
                  error ?? copy.noRecentOrderDesc
                }
                action={
                  <Link
                    href="/products"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#a88672] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#916f5b]"
                  >
                    {copy.continueShopping}
                  </Link>
                }
              />
            </div>
          ) : (
            <>
              <section className="mx-auto max-w-[820px] text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(214,187,165,0.28)] bg-white/80 text-[#d0a383] shadow-[0_18px_40px_rgba(148,117,99,0.1)]">
                  <BadgeCheck className="h-6 w-6" />
                </div>
                <h1
                  className="mt-8 text-[46px] leading-none text-[#4a3b34] sm:text-[64px]"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {copy.heroTitle}
                </h1>
                <p className="mx-auto mt-4 max-w-[520px] text-[14px] leading-7 text-[#ab998c]">
                  {copy.heroSubtitle.replace("{id}", String(order.id))}
                </p>
              </section>

              <section className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p
                        className="text-[28px] leading-none text-[#56463f]"
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        {copy.giftSummary}
                      </p>
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c6b0a2]">
                      {copy.itemsOrdered.replace("{count}", String(items.length))}
                    </p>
                  </div>

                  <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    {featuredItems.map((item, index) => (
                      <article key={item.id} className="max-w-[280px]">
                        <div
                          className={`relative h-[280px] overflow-hidden rounded-t-[120px] rounded-b-[18px] ${
                            index % 2 === 0 ? "bg-[#f3dede]" : "bg-[#20201f]"
                          } shadow-[0_18px_40px_rgba(148,117,99,0.1)]`}
                        >
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            sizes="280px"
                            className="object-cover"
                          />
                        </div>
                        <div className="px-1 pb-1 pt-5">
                          <h2
                            className="text-[25px] leading-none text-[#584840]"
                            style={{ fontFamily: "var(--font-cormorant)" }}
                          >
                            {item.productName}
                          </h2>
                          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c2ada0]">
                            {copy.premiumBox} / {copy.quantity} {item.quantity}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="mt-14">
                    <p
                      className="text-[28px] leading-none text-[#56463f]"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {copy.personalTouch}
                    </p>

                    <div className="relative mt-6 rounded-[30px] border border-[rgba(185,158,140,0.14)] bg-white px-8 py-8 shadow-[0_20px_55px_rgba(148,117,99,0.08)]">
                      <Quote className="absolute right-6 top-6 h-4 w-4 text-[#e7d9cf]" />
                      <p
                        className="text-[16px] italic leading-8 text-[#b5a39a]"
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        {copy.dearBloom}
                      </p>
                      <p
                        className="mt-5 max-w-[620px] text-[31px] leading-[1.35] text-[#726055]"
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        {thankYouNote}
                      </p>
                      <p
                        className="mt-6 text-right text-[16px] italic text-[#c0aea3]"
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        {copy.foreverYours}
                      </p>
                    </div>
                  </div>
                </div>

                <aside>
                  <div className="rounded-[34px] border border-[rgba(185,158,140,0.14)] bg-white px-8 py-8 shadow-[0_24px_70px_rgba(148,117,99,0.12)]">
                    <div className="flex items-center gap-3 text-[#caa88e]">
                      <ReceiptText className="h-5 w-5" />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.26em]">
                        {copy.paymentMethod}
                      </p>
                    </div>

                    <p
                      className="mt-4 text-[24px] leading-none text-[#645148]"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {formatPaymentMethod(order.paymentMethod, locale)}
                    </p>

                    <div className="mt-8 border-t border-[#f3e8e0] pt-7">
                      <p
                        className="text-[30px] leading-none text-[#56463f]"
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        {copy.whatsNext}
                      </p>
                      <p className="mt-4 text-[14px] leading-7 text-[#9d8a7d]">
                        {copy.whatsNextDesc}
                      </p>
                    </div>

                    <div className="mt-8 rounded-[24px] bg-[#fcf7f2] px-6 py-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#cab0a0]">
                        {copy.orderStatus}
                      </p>
                      <p
                        className="mt-3 text-[28px] leading-none text-[#645148]"
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        {formatOrderStatus(order.status, locale)}
                      </p>

                      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#cab0a0]">
                        {copy.totalPaid}
                      </p>
                      <p
                        className="mt-2 text-[42px] leading-none text-[#8f7060]"
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        {formatCurrency(order.totalAmount, locale)}
                      </p>
                      <p className="mt-3 text-[12px] leading-6 text-[#a59286]">
                        {copy.confirmedOn.replace("{date}", formatOrderDate(order.updatedAt, locale))}
                      </p>
                    </div>

                    <div className="mt-8 rounded-[24px] bg-[#fcf7f2] px-6 py-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#cab0a0]">
                        {copy.rewardsTitle}
                      </p>
                      <div className="mt-4 space-y-4 text-[13px] text-[#7b6a5f]">
                        <div className="flex items-center justify-between gap-3">
                          <span>{copy.pointsEarned}</span>
                          <span className="font-semibold text-[#166534]">+{earnedPoints} {copy.pointsUnit}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span>{copy.pointsRedeemed}</span>
                          <span className="font-semibold text-[#6f5c50]">{order.redeemedPoints} {copy.pointsUnit}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span>{copy.rewardsDiscount}</span>
                          <span className="font-semibold text-[#166534]">
                            -{formatCurrency(order.rewardsDiscountAmount, locale)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-4 text-[12px] leading-6 text-[#a59286]">
                        {copy.rewardsFormula}
                      </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                      <Link
                        href={`/checkout/tracking?orderId=${order.id}`}
                        className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-[#a88672] px-6 text-[14px] font-medium text-white transition-colors hover:bg-[#916f5b]"
                      >
                        {copy.tracking}
                        <Truck className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/products"
                        className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-[rgba(173,145,124,0.18)] bg-white px-6 text-[14px] font-medium text-[#5d4a40] transition-colors hover:bg-[#fff7f1]"
                      >
                        {copy.continueShopping}
                      </Link>
                    </div>

                    <div className="mt-8 rounded-[22px] border border-[rgba(185,158,140,0.12)] bg-[#fffdfa] px-5 py-4">
                      <div className="flex items-center gap-2 text-[#d0a383]">
                        <Sparkles className="h-4 w-4" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                          {copy.deliveryUpdate}
                        </p>
                      </div>
                      <p className="mt-3 text-[13px] leading-6 text-[#9d8a7d]">
                        {copy.deliveryUpdateDesc}
                      </p>
                    </div>
                  </div>
                </aside>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
