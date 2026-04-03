"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { CreditCard, PackageCheck, RefreshCw, ShoppingBag } from "lucide-react";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import { formatCurrency } from "@/lib/currency";
import { isApiError, ordersApi, paymentsApi } from "@/lib/api";
import {
  formatOrderDate,
  formatOrderStatus,
  formatPaymentMethod,
  loadOrderProducts,
  mapOrderItemToDisplay,
  OrderDisplayItem,
} from "@/lib/mappers";
import { OrderDTO, PaymentReconciliationDTO } from "@/lib/api/types";
import { useAuth } from "@/src/contexts";

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

export function TrackingPageContent() {
  const searchParams = useSearchParams();
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
              : "Payment reconciliation is temporarily unavailable."
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
  }, [authLoading, orderId, user]);

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
            : "Payment reconciliation is temporarily unavailable."
        );
      }
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [order, user]);

  return (
    <div className="min-h-screen bg-[#fdfaf7]">
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-10 pb-24 pt-16 sm:px-8 lg:px-10 lg:pt-20">
        <div className="mx-auto max-w-[1120px]">
          {authLoading || isLoading ? (
            <div className="h-[520px] rounded-[40px] bg-white/70 animate-pulse" />
          ) : !user ? (
            <TrackingStateCard
              title="Sign in to track your order"
              description="Tracking uses the real backend order and payment status for the authenticated user."
              action={
                <Link
                  href="/signin"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#d0bb95] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571]"
                >
                  Go to Sign In
                </Link>
              }
            />
          ) : !order ? (
            <TrackingStateCard
              title={error ? "Unable to load tracking" : "No order available"}
              description={
                error ??
                "Create a real order first to inspect backend order and payment status here."
              }
              action={
                <Link
                  href="/products"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#d0bb95] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571]"
                >
                  Continue Shopping
                </Link>
              }
            />
          ) : (
            <>
              <header className="rounded-[40px] bg-white px-10 py-10 shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-[#d0bb95]">
                      Backend Tracking
                    </p>
                    <h1
                      className="mt-3 text-[42px] font-light leading-[1] text-[#2c2825]"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      Order #{order.id}
                    </h1>
                    <p className="mt-4 text-[14px] leading-6 text-[#5c6b5e]">
                      Created at {formatOrderDate(order.createdAt)} with payment{" "}
                      {formatPaymentMethod(order.paymentMethod)}.
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
                            : "Payment reconciliation is temporarily unavailable."
                        );
                      }
                    }}
                    className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[12px] border border-[rgba(138,109,93,0.16)] px-6 text-[14px] font-medium text-[#2c2825] transition-colors hover:bg-[#fdfaf7]"
                  >
                    Refresh Status
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </header>

              <div className="mt-12 grid gap-10 xl:grid-cols-[320px_minmax(0,1fr)]">
                <aside className="space-y-6">
                  <div className="rounded-[40px] bg-white px-8 py-8 shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
                    <div className="flex items-center gap-3">
                      <PackageCheck className="h-5 w-5 text-[#d4a373]" />
                      <p className="text-[12px] font-bold uppercase tracking-[1px] text-[#9ca3af]">
                        Order Status
                      </p>
                    </div>
                    <p
                      className="mt-5 text-[28px] leading-8 text-[#2c2825]"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {formatOrderStatus(order.status)}
                    </p>
                    <p className="mt-3 text-[14px] leading-6 text-[#5c6b5e]">
                      Last updated {formatOrderDate(order.updatedAt)}
                    </p>
                  </div>

                  <div className="rounded-[40px] bg-white px-8 py-8 shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-[#d4a373]" />
                      <p className="text-[12px] font-bold uppercase tracking-[1px] text-[#9ca3af]">
                        Payment Reconciliation
                      </p>
                    </div>
                    <p
                      className="mt-5 text-[28px] leading-8 text-[#2c2825]"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {reconciliation?.paid ? "Paid" : "Pending"}
                    </p>
                    <p className="mt-3 text-[14px] leading-6 text-[#5c6b5e]">
                      {reconciliation
                        ? `${reconciliation.transactionCount} transaction records`
                        : "No reconciliation records returned yet."}
                    </p>
                    {reconciliationError ? (
                      <p className="mt-3 text-[12px] leading-5 text-[#b45309]">
                        {reconciliationError}
                      </p>
                    ) : null}
                    {reconciliation?.transactions?.length ? (
                      <ul className="mt-6 space-y-2 text-[12px] leading-5 text-[#8a6d5d]">
                        {reconciliation.transactions.map((transaction) => (
                          <li key={transaction}>{transaction}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  <div className="rounded-[40px] bg-white px-8 py-8 shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
                    <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#9ca3af]">
                      Backend Total
                    </p>
                    <p
                      className="mt-3 text-[32px] leading-9 text-[#8a6d5d]"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                </aside>

                <section className="rounded-[40px] bg-white px-10 py-10 shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-5 w-5 text-[#d4a373]" />
                      <h2
                        className="text-[28px] font-medium leading-8 text-[#2c2825]"
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        Order Contents
                      </h2>
                    </div>
                    <span className="text-[12px] uppercase tracking-[1px] text-[#9ca3af]">
                      {items.length} products
                    </span>
                  </div>
                  <div className="mt-8 space-y-6">
                    {items.map((item) => (
                      <article
                        key={item.id}
                        className="flex flex-col gap-5 border-b border-[rgba(138,109,93,0.08)] pb-6 last:border-b-0 last:pb-0 sm:flex-row sm:items-center"
                      >
                        <div className="relative h-28 w-24 overflow-hidden rounded-tl-[80px] rounded-tr-[80px] rounded-bl-[8px] rounded-br-[8px] bg-[#f3ede6]">
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-[22px] leading-7 text-[#2c2825]"
                            style={{ fontFamily: "var(--font-cormorant)" }}
                          >
                            {item.productName}
                          </p>
                          <p className="mt-2 text-[12px] uppercase tracking-[1px] text-[#9ca3af]">
                            Quantity {item.quantity}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-[14px] leading-6 text-[#5c6b5e]">
                            {formatCurrency(item.price)} each
                          </p>
                          <p
                            className="mt-1 text-[20px] leading-7 text-[#8a6d5d]"
                            style={{ fontFamily: "var(--font-cormorant)" }}
                          >
                            {formatCurrency(item.subtotal)}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
      <ChatLive />
    </div>
  );
}
