"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import QRCode from "qrcode";
import { ArrowUpRight, Clock3, RefreshCw, ScanQrCode, ShieldCheck } from "lucide-react";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import { formatCurrency } from "@/lib/currency";
import { isApiError, ordersApi, paymentsApi } from "@/lib/api";
import {
  formatOrderStatus,
  loadOrderProducts,
  mapOrderItemToDisplay,
  OrderDisplayItem,
} from "@/lib/mappers";
import { OrderDTO, PaymentCheckoutDTO, PaymentReconciliationDTO } from "@/lib/api/types";
import { useAuth } from "@/src/contexts";

function formatTimer(totalSeconds: number): string {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getInlineQrImage(checkout: PaymentCheckoutDTO | null): string | null {
  if (!checkout) {
    return null;
  }

  return checkout.checkoutUrl?.startsWith("data:image/") ? checkout.checkoutUrl : null;
}

function QrStateCard({
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

export function QrPaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [items, setItems] = useState<OrderDisplayItem[]>([]);
  const [checkout, setCheckout] = useState<PaymentCheckoutDTO | null>(null);
  const [reconciliation, setReconciliation] =
    useState<PaymentReconciliationDTO | null>(null);
  const [qrImageSrc, setQrImageSrc] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orderId = Number(searchParams.get("orderId") || "0");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || orderId <= 0) {
      setIsLoading(false);
      return;
    }

    let active = true;

    const loadPayment = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [nextOrder, nextCheckout, nextReconciliation] = await Promise.all([
          ordersApi.getById(orderId),
          paymentsApi.createVietQrCheckout(orderId),
          paymentsApi.reconcile(orderId),
        ]);
        const productsById = await loadOrderProducts(
          nextOrder.items.map((item) => item.productId)
        );

        if (!active) {
          return;
        }

        setOrder(nextOrder);
        setCheckout(nextCheckout);
        setReconciliation(nextReconciliation);
        setRemainingSeconds(nextCheckout.expiresInSeconds);
        setItems(
          nextOrder.items.map((item) => mapOrderItemToDisplay(item, productsById[item.productId]))
        );
      } catch (fetchError) {
        if (!active) {
          return;
        }

        setOrder(null);
        setCheckout(null);
        setReconciliation(null);
        setItems([]);
        setError(
          isApiError(fetchError)
            ? fetchError.message
            : "Unable to load QR checkout right now."
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadPayment();

    return () => {
      active = false;
    };
  }, [authLoading, orderId, user]);

  useEffect(() => {
    if (!checkout || remainingSeconds <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setRemainingSeconds((currentValue) =>
        currentValue > 0 ? currentValue - 1 : 0
      );
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [checkout, remainingSeconds]);

  useEffect(() => {
    if (!user || orderId <= 0 || !checkout) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const nextReconciliation = await paymentsApi.reconcile(orderId);
        setReconciliation(nextReconciliation);
      } catch {
        return;
      }
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [checkout, orderId, user]);

  useEffect(() => {
    if (!reconciliation?.paid || !order) {
      return;
    }

    const redirectTimer = window.setTimeout(() => {
      router.push(`/checkout/complete?orderId=${order.id}`);
    }, 1500);

    return () => {
      window.clearTimeout(redirectTimer);
    };
  }, [order, reconciliation?.paid, router]);

  useEffect(() => {
    let active = true;

    const buildQrImage = async () => {
      const inlineQrImage = getInlineQrImage(checkout);
      if (inlineQrImage) {
        setQrImageSrc(inlineQrImage);
        return;
      }

      if (!checkout?.qrContent) {
        setQrImageSrc(null);
        return;
      }

      try {
        const nextQrImageSrc = await QRCode.toDataURL(checkout.qrContent, {
          width: 480,
          margin: 1,
          errorCorrectionLevel: "M",
          color: {
            dark: "#2c2825",
            light: "#ffffff",
          },
        });

        if (active) {
          setQrImageSrc(nextQrImageSrc);
        }
      } catch {
        if (active) {
          setQrImageSrc(null);
        }
      }
    };

    buildQrImage();

    return () => {
      active = false;
    };
  }, [checkout]);

  return (
    <div className="min-h-screen bg-[#fdfaf7]">
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-10 pb-20 pt-16 sm:px-8 lg:px-10 lg:pt-24">
        <div className="mx-auto max-w-[1100px]">
          {authLoading || isLoading ? (
            <div className="h-[560px] rounded-[40px] bg-white/70 animate-pulse" />
          ) : !user ? (
            <QrStateCard
              title="Sign in to continue"
              description="QR checkout is generated from the real payment API and requires an authenticated session."
              action={
                <Link
                  href="/signin"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#d0bb95] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571]"
                >
                  Go to Sign In
                </Link>
              }
            />
          ) : !order || !checkout ? (
            <QrStateCard
              title="QR payment unavailable"
              description={error ?? "Create a real order first to receive a QR checkout payload."}
              action={
                <Link
                  href="/checkout"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#d0bb95] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571]"
                >
                  Return to Checkout
                </Link>
              }
            />
          ) : (
            <>
              <header className="rounded-[40px] bg-white px-10 py-10 shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fdf3ea] text-[#d4a373]">
                      <ScanQrCode className="h-7 w-7" strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-[#d0bb95]">
                        Real Payment Checkout
                      </p>
                      <h1
                        className="mt-3 text-[42px] font-light leading-[1] text-[#2c2825]"
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        Order #{order.id}
                      </h1>
                      <p className="mt-4 text-[14px] leading-6 text-[#5c6b5e]">
                        Provider {checkout.provider}. Status {formatOrderStatus(order.status)}.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-[24px] bg-[#fdfaf7] px-6 py-5">
                    <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#9ca3af]">
                      Expires In
                    </p>
                    <p
                      className="mt-2 text-[30px] leading-9 text-[#2c2825]"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {formatTimer(remainingSeconds)}
                    </p>
                  </div>
                </div>
              </header>

              <div className="mt-12 grid gap-10 xl:grid-cols-[minmax(0,1fr)_320px]">
                <section className="space-y-8">
                  <div className="rounded-[40px] bg-white px-10 py-10 shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-[#d4a373]" />
                      <p className="text-[12px] font-bold uppercase tracking-[1px] text-[#9ca3af]">
                        QR Payload
                      </p>
                    </div>
                    <p className="mt-4 text-[14px] leading-6 text-[#5c6b5e]">
                      Scan this QR in your banking app. If your bank app does not
                      support scanning from screen, you can still use the raw
                      payload below or open the provider checkout page directly.
                    </p>
                    <div className="mt-6 flex justify-center">
                      <div className="rounded-[28px] border border-[rgba(138,109,93,0.12)] bg-[#fdfaf7] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                        {qrImageSrc ? (
                          <div className="relative h-[320px] w-[320px] overflow-hidden rounded-[20px] bg-white">
                            <Image
                              src={qrImageSrc}
                              alt={`QR payment for order ${order.id}`}
                              fill
                              unoptimized
                              sizes="320px"
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex h-[320px] w-[320px] items-center justify-center rounded-[20px] bg-white px-8 text-center text-[14px] leading-6 text-[#8a6d5d]">
                            Unable to render QR image right now. You can still use
                            the payment payload below.
                          </div>
                        )}
                      </div>
                    </div>
                    {checkout.qrContent ? (
                      <textarea
                        readOnly
                        value={checkout.qrContent}
                        className="mt-6 h-36 w-full resize-none rounded-[24px] border border-[rgba(138,109,93,0.12)] bg-[#fdfaf7] px-6 py-5 text-[13px] leading-6 text-[#2c2825] outline-none"
                      />
                    ) : null}
                    {checkout.note ? (
                      <p className="mt-4 text-[12px] leading-6 text-[#8a6d5d]">
                        {checkout.note}
                      </p>
                    ) : null}
                    <div className="mt-6 flex flex-wrap gap-3">
                      {checkout.checkoutUrl ? (
                        <Link
                          href={checkout.checkoutUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[12px] bg-[#8a6d5d] px-6 text-[14px] font-medium text-white transition-colors hover:bg-[#775f51]"
                        >
                          Open Provider Checkout
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const nextReconciliation = await paymentsApi.reconcile(order.id);
                            setReconciliation(nextReconciliation);
                          } catch {
                            return;
                          }
                        }}
                        className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[12px] border border-[rgba(138,109,93,0.16)] px-6 text-[14px] font-medium text-[#2c2825] transition-colors hover:bg-[#fdfaf7]"
                      >
                        Refresh Status
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[40px] bg-white px-10 py-10 shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
                    <div className="flex items-center justify-between gap-4">
                      <h2
                        className="text-[28px] font-medium leading-8 text-[#2c2825]"
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        Order Items
                      </h2>
                      <span className="text-[12px] uppercase tracking-[1px] text-[#9ca3af]">
                        {items.length} products
                      </span>
                    </div>
                    <div className="mt-8 space-y-5">
                      {items.map((item) => (
                        <article
                          key={item.id}
                          className="flex gap-4 border-b border-[rgba(138,109,93,0.08)] pb-5 last:border-b-0 last:pb-0"
                        >
                          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-[#f3ede6]">
                            <Image
                              src={item.image}
                              alt={item.productName}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-[20px] leading-7 text-[#2c2825]"
                              style={{ fontFamily: "var(--font-cormorant)" }}
                            >
                              {item.productName}
                            </p>
                            <p className="mt-1 text-[12px] uppercase tracking-[1px] text-[#9ca3af]">
                              Quantity {item.quantity}
                            </p>
                          </div>
                          <p className="text-[14px] leading-6 text-[#8a6d5d]">
                            {formatCurrency(item.subtotal)}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>

                <aside className="space-y-6">
                  <div className="rounded-[40px] bg-white px-8 py-8 shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
                    <div className="flex items-center gap-3">
                      <Clock3 className="h-5 w-5 text-[#d4a373]" />
                      <p className="text-[12px] font-bold uppercase tracking-[1px] text-[#9ca3af]">
                        Payment Status
                      </p>
                    </div>
                    <p
                      className="mt-5 text-[28px] leading-8 text-[#2c2825]"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {reconciliation?.paid ? "Paid" : "Awaiting payment"}
                    </p>
                    <p className="mt-3 text-[14px] leading-6 text-[#5c6b5e]">
                      {reconciliation
                        ? `${reconciliation.transactionCount} transaction records found.`
                        : "No reconciliation data yet."}
                    </p>
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
                    <div className="mt-8 flex flex-col gap-3">
                      <Link
                        href={`/checkout/complete?orderId=${order.id}`}
                        className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#8a6d5d] px-6 text-[14px] font-medium text-white transition-colors hover:bg-[#775f51]"
                      >
                        View Confirmation
                      </Link>
                      <Link
                        href={`/checkout/tracking?orderId=${order.id}`}
                        className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] border border-[rgba(138,109,93,0.16)] px-6 text-[14px] font-medium text-[#2c2825] transition-colors hover:bg-[#fdfaf7]"
                      >
                        View Tracking
                      </Link>
                    </div>
                  </div>
                </aside>
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
