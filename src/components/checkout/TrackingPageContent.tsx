"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  Flower2,
  Home,
  Leaf,
  MapPin,
  RefreshCw,
  Scissors,
  Sparkles,
  Truck,
} from "lucide-react";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import { formatCurrency } from "@/lib/currency";
import { isApiError, ordersApi, paymentsApi } from "@/lib/api";
import {
  formatOrderDate,
  formatPaymentMethod,
  loadOrderProducts,
  mapOrderItemToDisplay,
  OrderDisplayItem,
} from "@/lib/mappers";
import { OrderDTO, PaymentReconciliationDTO } from "@/lib/api/types";
import { useAuth, useLocale } from "@/src/contexts";

function TrackingStateCard({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[40px] bg-white px-10 py-10 text-center shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
      <h2
        className="text-[32px] font-medium leading-[38px] text-[#2c2825]"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-[520px] text-[14px] leading-6 text-[#5c6b5e]">
        {description}
      </p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}

function formatClock(value: Date | null, locale: "en" | "vi"): string {
  if (!value || Number.isNaN(value.getTime())) {
    return "--:--";
  }

  return value.toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function offsetMinutes(value: Date | null, minutes: number): Date | null {
  if (!value || Number.isNaN(value.getTime())) {
    return null;
  }

  return new Date(value.getTime() + minutes * 60_000);
}

type StepStatus = "done" | "active" | "upcoming";

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  time: string;
  badge?: string;
  status: StepStatus;
  icon: ReactNode;
}

function statusStyles(status: StepStatus) {
  if (status === "done") {
    return {
      marker: "bg-[#d7a777] text-white border border-[#d7a777]",
      title: "text-[#5a463a]",
      desc: "text-[#a58e7f]",
      time: "text-[#cf9b69]",
      line: "bg-[#ead8c8]",
    };
  }

  if (status === "active") {
    return {
      marker: "bg-[#fffdf9] text-[#d7a777] border border-[#d7a777]",
      title: "text-[#4e3a2e]",
      desc: "text-[#8b7567]",
      time: "text-[#d7a777]",
      line: "bg-[#ead8c8]",
    };
  }

  return {
    marker: "bg-[#f6f1eb] text-[#cfc0b3] border border-[#ece2d8]",
    title: "text-[#b3a196]",
    desc: "text-[#c7bbb3]",
    time: "text-[#cfbfb3]",
    line: "bg-[#f1e9e2]",
  };
}

export function TrackingPageContent() {
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [items, setItems] = useState<OrderDisplayItem[]>([]);
  const [reconciliation, setReconciliation] =
    useState<PaymentReconciliationDTO | null>(null);
  const [reconciliationError, setReconciliationError] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orderId = Number(searchParams.get("orderId") || "0");

  const copy =
    locale === "vi"
      ? {
          reconcileUnavailable: "Doi soat thanh toan tam thoi khong kha dung.",
          signInTitle: "Dang nhap de theo doi don hang",
          signInDesc: "Trang theo doi su dung du lieu don hang va thanh toan thuc tu backend.",
          goToSignIn: "Den trang dang nhap",
          loadTracking: "Khong the tai theo doi",
          noOrder: "Chua co don hang",
          noOrderDesc: "Hay tao don hang thuc de xem trang thai don va thanh toan tai day.",
          continueShopping: "Tiep tuc mua sam",
          title: "Hanh trinh cua bo hoa",
          subtitle: "Don #{id} - Du kien den {time}",
          createdAt: "Tao luc {date} voi hinh thuc thanh toan {method}",
          refreshStatus: "Lam moi trang thai",
          liveTracking: "Theo doi truc tiep",
          lastUpdated: "Cap nhat {time}",
          yourDeliveryHero: "Nguoi giao cua ban",
          courierName: "Minh Quan",
          courierRole: "Tuyen giao nhanh",
          courierDesc: "Dan bo hoa qua cac cung duong an toan de giu tung canh hoa tuoi dep.",
          contact: "Lien he",
          ecoTransit: "Eco-Friendly Transit",
          ecoTransitDesc: "Tuyen giao toi uu de giam phat thai va bao toan do tuoi bo hoa.",
          freshnessLocked: "Freshness Locked",
          freshnessLockedDesc: "Goi chong soc va nhiet do on dinh giup bo hoa luon trang thai dep nhat.",
          conciergeSupport: "Concierge Support",
          conciergeSupportDesc: "Ho tro truc tiep 24/7 neu ban can dieu chinh lich giao hoac dia diem.",
          stepPlacedTitle: "Order Placed",
          stepPlacedDesc: "Thong tin thanh toan da duoc ghi nhan va cho xu ly.",
          stepCraftingTitle: "Hand-crafting Bouquet",
          stepCraftingDesc: "Nghe nhan dang sap xep bo hoa theo mau va loi nhan cua ban.",
          stepTransitTitle: "Out for Delivery",
          stepTransitDesc: "Bo hoa dang tren duong den tay ban.",
          stepArrivedTitle: "Arrived",
          stepArrivedDesc: "Don duoc giao thanh cong tai dia chi cua ban.",
          inTransit: "IN TRANSIT",
          orderTotal: "Tong thanh toan",
          paymentMethod: "Phuong thuc",
          itemCount: "{count} san pham",
          paid: "Da thanh toan",
          pending: "Dang cho doi soat",
        }
      : {
          reconcileUnavailable: "Payment reconciliation is temporarily unavailable.",
          signInTitle: "Sign in to track your order",
          signInDesc: "Tracking uses the real backend order and payment status for the authenticated user.",
          goToSignIn: "Go to Sign In",
          loadTracking: "Unable to load tracking",
          noOrder: "No order available",
          noOrderDesc: "Create a real order first to inspect backend order and payment status here.",
          continueShopping: "Continue Shopping",
          title: "Journey of your blooms",
          subtitle: "Order #{id} - Estimated arrival {time}",
          createdAt: "Created at {date} with payment {method}",
          refreshStatus: "Refresh Status",
          liveTracking: "Live tracking",
          lastUpdated: "Last updated {time}",
          yourDeliveryHero: "Your delivery hero",
          courierName: "Minh Quan",
          courierRole: "Lead courier",
          courierDesc: "Guides each arrangement across the city while keeping every stem in peak condition.",
          contact: "Contact",
          ecoTransit: "Eco-Friendly Transit",
          ecoTransitDesc: "Smarter routing and low-emission delivery to protect every bloom.",
          freshnessLocked: "Freshness Locked",
          freshnessLockedDesc: "Thermal-safe handling keeps your flowers fresh from studio to doorstep.",
          conciergeSupport: "Concierge Support",
          conciergeSupportDesc: "Need delivery help? Our concierge team is available whenever you need updates.",
          stepPlacedTitle: "Order Placed",
          stepPlacedDesc: "Payment details were received and queued for fulfillment.",
          stepCraftingTitle: "Hand-crafting Bouquet",
          stepCraftingDesc: "Our florists are arranging your bouquet with selected stems.",
          stepTransitTitle: "Out for Delivery",
          stepTransitDesc: "Your arrangement is now on its way to your address.",
          stepArrivedTitle: "Arrived",
          stepArrivedDesc: "Delivery completed at your destination.",
          inTransit: "IN TRANSIT",
          orderTotal: "Total paid",
          paymentMethod: "Payment method",
          itemCount: "{count} items",
          paid: "Paid",
          pending: "Pending reconciliation",
        };

  const orderCreatedAt = order?.createdAt;

  const parsedCreatedAt = useMemo(() => {
    if (!orderCreatedAt) {
      return null;
    }

    return new Date(orderCreatedAt);
  }, [orderCreatedAt]);
  const estimatedArrival = useMemo(() => offsetMinutes(parsedCreatedAt, 165), [parsedCreatedAt]);
  const hasPayment = reconciliation?.paid || order?.status === "CONFIRMED";

  const timelineSteps: TimelineStep[] = useMemo(() => {
    const placedAt = formatClock(parsedCreatedAt, locale);
    const craftedAt = formatClock(offsetMinutes(parsedCreatedAt, 30), locale);
    const transitAt = formatClock(offsetMinutes(parsedCreatedAt, 90), locale);
    const arrivedAt = formatClock(offsetMinutes(parsedCreatedAt, 165), locale);

    const craftingStatus: StepStatus = hasPayment ? "done" : "active";
    const transitStatus: StepStatus = hasPayment ? "active" : "upcoming";

    return [
      {
        id: "placed",
        title: copy.stepPlacedTitle,
        description: copy.stepPlacedDesc,
        time: placedAt,
        status: "done",
        icon: <CheckCircle2 className="h-4 w-4" />,
      },
      {
        id: "crafting",
        title: copy.stepCraftingTitle,
        description: copy.stepCraftingDesc,
        time: craftedAt,
        status: craftingStatus,
        icon: <Scissors className="h-4 w-4" />,
      },
      {
        id: "transit",
        title: copy.stepTransitTitle,
        description: copy.stepTransitDesc,
        time: transitAt,
        badge: hasPayment ? copy.inTransit : undefined,
        status: transitStatus,
        icon: <Truck className="h-4 w-4" />,
      },
      {
        id: "arrived",
        title: copy.stepArrivedTitle,
        description: copy.stepArrivedDesc,
        time: arrivedAt,
        status: "upcoming",
        icon: <Home className="h-4 w-4" />,
      },
    ];
  }, [copy.inTransit, copy.stepArrivedDesc, copy.stepArrivedTitle, copy.stepCraftingDesc, copy.stepCraftingTitle, copy.stepPlacedDesc, copy.stepPlacedTitle, copy.stepTransitDesc, copy.stepTransitTitle, hasPayment, locale, parsedCreatedAt]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setIsLoading(false);
      return;
    }

    let active = true;

    const loadTracking = async () => {
      setIsLoading(true);
      setError(null);
      setReconciliationError(null);

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

        try {
          const nextReconciliation = await paymentsApi.reconcile(nextOrder.id);
          if (!active) {
            return;
          }
          setReconciliation(nextReconciliation);
          setReconciliationError(null);
        } catch (reconcileError) {
          if (!active) {
            return;
          }

          setReconciliation(null);
          setReconciliationError(
            isApiError(reconcileError)
              ? reconcileError.message
              : copy.reconcileUnavailable
          );
        }
      } catch (fetchError) {
        if (!active) {
          return;
        }

        setOrder(null);
        setItems([]);
        setReconciliation(null);
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

    loadTracking();

    return () => {
      active = false;
    };
  }, [authLoading, copy.reconcileUnavailable, orderId, user]);

  useEffect(() => {
    if (!user || !order) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const nextReconciliation = await paymentsApi.reconcile(order.id);
        setReconciliation(nextReconciliation);
        setReconciliationError(null);
      } catch (reconcileError) {
        setReconciliation(null);
        setReconciliationError(
          isApiError(reconcileError)
            ? reconcileError.message
            : copy.reconcileUnavailable
        );
      }
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [copy.reconcileUnavailable, order, user]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fbf4ec_55%,#fffdfb_100%)]">
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-6 pb-24 pt-16 sm:px-8 lg:px-10 lg:pt-20">
        <div className="mx-auto max-w-[1140px]">
          {authLoading || isLoading ? (
            <div className="h-[520px] rounded-[40px] bg-white/70 animate-pulse" />
          ) : !user ? (
            <TrackingStateCard
              title={copy.signInTitle}
              description={copy.signInDesc}
              action={
                <Link
                  href="/signin"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#d0bb95] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571]"
                >
                  {copy.goToSignIn}
                </Link>
              }
            />
          ) : !order ? (
            <TrackingStateCard
              title={error ? copy.loadTracking : copy.noOrder}
              description={error ?? copy.noOrderDesc}
              action={
                <Link
                  href="/products"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#d0bb95] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571]"
                >
                  {copy.continueShopping}
                </Link>
              }
            />
          ) : (
            <>
              <header className="rounded-[36px] bg-white px-8 py-8 shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h1
                      className="text-[46px] font-light leading-none text-[#4f3e33]"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {copy.title}
                    </h1>
                    <p className="mt-4 text-[14px] leading-6 text-[#5c6b5e]">
                      {copy.subtitle
                        .replace("{id}", String(order.id))
                        .replace("{time}", formatClock(estimatedArrival, locale))}
                    </p>
                    <p className="mt-2 text-[12px] uppercase tracking-[0.12em] text-[#b7a496]">
                      {copy.createdAt
                        .replace("{date}", formatOrderDate(order.createdAt, locale))
                        .replace("{method}", formatPaymentMethod(order.paymentMethod, locale))}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const nextReconciliation = await paymentsApi.reconcile(order.id);
                        setReconciliation(nextReconciliation);
                        setReconciliationError(null);
                      } catch (reconcileError) {
                        setReconciliation(null);
                        setReconciliationError(
                          isApiError(reconcileError)
                            ? reconcileError.message
                            : copy.reconcileUnavailable
                        );
                      }
                    }}
                    className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[12px] border border-[rgba(138,109,93,0.16)] bg-white px-6 text-[13px] font-semibold uppercase tracking-[0.16em] text-[#6e5a4d] transition-colors hover:bg-[#fdf7f2]"
                  >
                    {copy.refreshStatus}
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </header>

              <div className="mt-12 grid gap-8 xl:grid-cols-[minmax(0,1fr)_520px]">
                <section className="rounded-[36px] bg-white px-8 py-8 shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
                  <div className="relative pl-12">
                    {timelineSteps.map((step, index) => {
                      const styles = statusStyles(step.status);
                      const showLine = index < timelineSteps.length - 1;

                      return (
                        <article key={step.id} className="relative pb-10 last:pb-0">
                          <span
                            className={`absolute left-[-48px] top-0 inline-flex h-8 w-8 items-center justify-center rounded-full ${styles.marker}`}
                          >
                            {step.icon}
                          </span>

                          {showLine ? (
                            <span className={`absolute left-[-33px] top-8 h-[calc(100%-8px)] w-px ${styles.line}`} />
                          ) : null}

                          <h2 className={`text-[24px] leading-none ${styles.title}`} style={{ fontFamily: "var(--font-cormorant)" }}>
                            {step.title}
                          </h2>
                          <p className={`mt-3 text-[14px] leading-6 ${styles.desc}`}>
                            {step.description}
                          </p>
                          <div className="mt-3 flex items-center gap-3">
                            <span className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${styles.time}`}>
                              {step.time}
                            </span>
                            {step.badge ? (
                              <span className="rounded-full bg-[#fff4e8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c98f58]">
                                {step.badge}
                              </span>
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {reconciliationError ? (
                    <p className="mt-4 rounded-[14px] bg-[#fff7ed] px-4 py-3 text-[12px] text-[#b45309]">
                      {reconciliationError}
                    </p>
                  ) : null}
                </section>

                <section className="space-y-6">
                  <div className="relative overflow-hidden rounded-[30px] border border-[rgba(206,184,165,0.36)] bg-[linear-gradient(180deg,#fcf8f3_0%,#fffefe_100%)] p-6 shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
                    <div className="absolute left-[-60px] top-[40px] h-px w-[420px] rotate-[22deg] bg-[#ead9cb]" />
                    <div className="absolute right-[-80px] top-[120px] h-px w-[420px] rotate-[-18deg] bg-[#ead9cb]" />
                    <div className="absolute left-[45%] top-[46%] h-[150px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[#c9a58a]" />

                    <span className="absolute left-8 top-8 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a2846f] shadow-sm">
                      <Home className="h-3.5 w-3.5 text-[#c8a282]" />
                      Home
                    </span>

                    <span className="absolute right-24 top-24 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e7d9cc] bg-white text-[#c8a282] shadow-sm">
                      <MapPin className="h-4 w-4" />
                    </span>

                    <div className="relative mt-44 flex items-center justify-between rounded-[16px] border border-[#f2e8df] bg-white px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b79478]">
                        {copy.liveTracking}
                      </p>
                      <p className="text-[12px] text-[#9e8b7e]">
                        {copy.lastUpdated.replace("{time}", formatClock(new Date(order.updatedAt), locale))}
                      </p>
                    </div>
                  </div>

                  <article className="rounded-[30px] border border-[rgba(206,184,165,0.36)] bg-white px-6 py-6 shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-[18px] bg-[#ef4b1d]">
                        <Image
                          src={items[0]?.image || "/images/hero-main.png"}
                          alt={copy.courierName}
                          fill
                          sizes="80px"
                          className="object-cover mix-blend-multiply"
                        />
                        <div className="absolute inset-0 bg-[#ef4b1d]/45" />
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <Flower2 className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d0b59c]">
                          {copy.yourDeliveryHero}
                        </p>
                        <h3 className="mt-2 text-[30px] leading-none text-[#4f3e33]" style={{ fontFamily: "var(--font-cormorant)" }}>
                          {copy.courierName}
                        </h3>
                        <p className="mt-2 text-[13px] text-[#8f7c6f]">{copy.courierRole}</p>
                      </div>

                      <button
                        type="button"
                        className="rounded-full border border-[#e7d9cc] px-4 py-2 text-[12px] font-medium text-[#6a5648] transition-colors hover:bg-[#fff8f2]"
                      >
                        {copy.contact}
                      </button>
                    </div>

                    <p className="mt-4 text-[13px] leading-6 text-[#8d7a6e]">
                      {copy.courierDesc}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[16px] bg-[#fdf8f3] px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c9ab93]">
                          {copy.orderTotal}
                        </p>
                        <p className="mt-2 text-[24px] leading-none text-[#7e6353]" style={{ fontFamily: "var(--font-cormorant)" }}>
                          {formatCurrency(order.totalAmount, locale)}
                        </p>
                      </div>
                      <div className="rounded-[16px] bg-[#fdf8f3] px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c9ab93]">
                          {copy.paymentMethod}
                        </p>
                        <p className="mt-2 text-[14px] leading-6 text-[#7e6353]">
                          {formatPaymentMethod(order.paymentMethod, locale)} • {hasPayment ? copy.paid : copy.pending}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-[12px] uppercase tracking-[0.14em] text-[#c9ab93]">
                      {copy.itemCount.replace("{count}", String(items.length))}
                    </p>
                  </article>
                </section>
              </div>

              <section className="mt-10 grid gap-5 md:grid-cols-3">
                <article className="rounded-[26px] bg-white px-6 py-6 text-center shadow-[0_16px_42px_rgba(138,109,93,0.08)]">
                  <Leaf className="mx-auto h-6 w-6 text-[#cc9a6f]" />
                  <h3 className="mt-4 text-[24px] leading-none text-[#4f3e33]" style={{ fontFamily: "var(--font-cormorant)" }}>
                    {copy.ecoTransit}
                  </h3>
                  <p className="mt-3 text-[13px] leading-6 text-[#8d7a6e]">{copy.ecoTransitDesc}</p>
                </article>

                <article className="rounded-[26px] bg-white px-6 py-6 text-center shadow-[0_16px_42px_rgba(138,109,93,0.08)]">
                  <Sparkles className="mx-auto h-6 w-6 text-[#cc9a6f]" />
                  <h3 className="mt-4 text-[24px] leading-none text-[#4f3e33]" style={{ fontFamily: "var(--font-cormorant)" }}>
                    {copy.freshnessLocked}
                  </h3>
                  <p className="mt-3 text-[13px] leading-6 text-[#8d7a6e]">{copy.freshnessLockedDesc}</p>
                </article>

                <article className="rounded-[26px] bg-white px-6 py-6 text-center shadow-[0_16px_42px_rgba(138,109,93,0.08)]">
                  <Truck className="mx-auto h-6 w-6 text-[#cc9a6f]" />
                  <h3 className="mt-4 text-[24px] leading-none text-[#4f3e33]" style={{ fontFamily: "var(--font-cormorant)" }}>
                    {copy.conciergeSupport}
                  </h3>
                  <p className="mt-3 text-[13px] leading-6 text-[#8d7a6e]">{copy.conciergeSupportDesc}</p>
                </article>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
      <ChatLive />
    </div>
  );
}
