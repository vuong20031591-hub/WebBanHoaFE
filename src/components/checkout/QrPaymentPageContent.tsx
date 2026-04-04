"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import QRCode from "qrcode";
import { Clock3, ExternalLink, ShieldCheck } from "lucide-react";
import { Footer, Navbar } from "@/components/layout";
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

type CheckoutProvider = "VIETQR" | "SEPAY";

function getPaymentSteps(provider: CheckoutProvider) {
  if (provider === "SEPAY") {
    return [
      {
        label: "STEP 01",
        title: "Open SePay",
        description: "Open the hosted checkout link or scan the code to start payment.",
      },
      {
        label: "STEP 02",
        title: "Transfer",
        description: "Complete transfer exactly with the provided amount and content.",
      },
      {
        label: "STEP 03",
        title: "Success",
        description: "We auto-confirm as soon as SePay reports a successful transaction.",
      },
    ] as const;
  }

  return [
    {
      label: "STEP 01",
      title: "Scan VietQR",
      description: "Use your banking app to scan the QR code shown here.",
    },
    {
      label: "STEP 02",
      title: "Authenticate",
      description: "Confirm the amount and transfer message exactly as provided.",
    },
    {
      label: "STEP 03",
      title: "Success",
      description: "Once payment is detected, we will move you to confirmation automatically.",
    },
  ] as const;
}

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

export function QrPaymentPageContent({
  provider = "VIETQR",
}: {
  provider?: CheckoutProvider;
}) {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const paymentSteps = getPaymentSteps(provider);
  const providerLabel = provider === "SEPAY" ? "SePay" : "VietQR";
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [items, setItems] = useState<OrderDisplayItem[]>([]);
  const [checkout, setCheckout] = useState<PaymentCheckoutDTO | null>(null);
  const [reconciliation, setReconciliation] =
    useState<PaymentReconciliationDTO | null>(null);
  const [qrImageSrc, setQrImageSrc] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
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
        const checkoutPromise =
          provider === "SEPAY"
            ? paymentsApi.createSePayCheckout(orderId)
            : paymentsApi.createVietQrCheckout(orderId);

        const [nextOrder, nextCheckout, nextReconciliation] = await Promise.all([
          ordersApi.getById(orderId),
          checkoutPromise,
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
            : `Unable to load ${providerLabel} checkout right now.`
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
  }, [authLoading, orderId, provider, providerLabel, user]);

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
    const shouldRedirect =
      !!order &&
      !!reconciliation &&
      (reconciliation.paid || reconciliation.orderStatus === "CONFIRMED");

    if (!shouldRedirect || !order || isRedirecting) {
      return;
    }

    setIsRedirecting(true);

    const redirectTimer = window.setTimeout(() => {
      window.location.assign(`/checkout/complete?orderId=${order.id}`);
    }, 800);

    return () => {
      window.clearTimeout(redirectTimer);
    };
  }, [isRedirecting, order, reconciliation]);

  useEffect(() => {
    let active = true;

    const buildQrImage = async () => {
      const inlineQrImage = getInlineQrImage(checkout);
      if (inlineQrImage) {
        setQrImageSrc(inlineQrImage);
        return;
      }

      const qrPayload = checkout?.qrContent || checkout?.checkoutUrl;

      if (!qrPayload) {
        setQrImageSrc(null);
        return;
      }

      try {
        const nextQrImageSrc = await QRCode.toDataURL(qrPayload, {
          width: 480,
          margin: 1,
          errorCorrectionLevel: "M",
          color: {
            dark: "#3e342d",
            light: "#fffdfb",
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#f8f1ea_50%,#fffdfb_100%)] text-[#3e342d]">
      <Navbar />
      <main className="overflow-hidden px-6 pb-20 pt-10 sm:px-8 lg:px-10 lg:pt-12">
        <div className="mx-auto max-w-[1280px]">
          {authLoading || isLoading ? (
            <div className="mx-auto h-[680px] max-w-[1120px] rounded-[40px] bg-white/70 animate-pulse" />
          ) : !user ? (
            <div className="mx-auto max-w-[760px]">
              <QrStateCard
                title="Sign in to continue"
                description={`${providerLabel} checkout is generated from the real payment API and requires an authenticated session.`}
                action={
                  <Link
                    href="/signin"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#a88672] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#916f5b]"
                  >
                    Go to Sign In
                  </Link>
                }
              />
            </div>
          ) : !order || !checkout ? (
            <div className="mx-auto max-w-[760px]">
              <QrStateCard
                title={`${providerLabel} payment unavailable`}
                description={error ?? `Create a real order first to receive a ${providerLabel} checkout payload.`}
                action={
                  <Link
                    href="/checkout"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#a88672] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#916f5b]"
                  >
                    Return to Checkout
                  </Link>
                }
              />
            </div>
          ) : (
            <>
              <header className="mx-auto max-w-[760px] text-center">
                <h1
                  className="text-[48px] font-medium leading-none text-[#4b3d35] sm:text-[62px]"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  Complete Your {providerLabel} Payment
                </h1>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.38em] text-[#d0b59c]">
                  Waiting For Secure Transaction Confirmation
                </p>
              </header>

              <div className="mt-10 grid gap-8 xl:grid-cols-[180px_minmax(0,420px)_240px] xl:items-start xl:justify-center">
                <section className="order-2 space-y-10 text-center xl:order-1 xl:pt-8">
                  {paymentSteps.map((step) => (
                    <article key={step.label}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#d0b59c]">
                        {step.label}
                      </p>
                      <h2
                        className="mt-3 text-[28px] leading-none text-[#7d6657]"
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        {step.title}
                      </h2>
                      <p className="mx-auto mt-3 max-w-[170px] text-[13px] leading-7 text-[#b09d91]">
                        {step.description}
                      </p>
                    </article>
                  ))}
                </section>

                <section className="order-1 xl:order-2">
                  <div className="relative mx-auto max-w-[420px] rounded-[40px] border border-[rgba(173,145,124,0.14)] bg-white px-8 pb-8 pt-8 text-center shadow-[0_28px_80px_rgba(148,117,99,0.1)]">
                    <div className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(208,181,156,0.28)] bg-[#fff8f3] text-[#d9af8d]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div className="mx-auto w-fit rounded-[34px] bg-[linear-gradient(180deg,#fbf1eb_0%,#fffefd_100%)] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                      <div className="rounded-[24px] bg-white p-5 shadow-[0_14px_32px_rgba(160,133,116,0.1)]">
                        {qrImageSrc ? (
                          <div className="relative h-[250px] w-[250px] overflow-hidden rounded-[18px] bg-white">
                            <Image
                              src={qrImageSrc}
                              alt={`QR payment for order ${order.id}`}
                              fill
                              unoptimized
                              sizes="250px"
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex h-[250px] w-[250px] items-center justify-center rounded-[18px] bg-[#fffaf6] px-8 text-center text-[14px] leading-6 text-[#8a6d5d]">
                            Unable to render QR image right now.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-7">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#d0b59c]">
                        Transaction Expiry
                      </p>
                      <p
                        className="mt-3 text-[34px] leading-none text-[#6d5649]"
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        Valid for {formatTimer(remainingSeconds)}
                      </p>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-3">
                      <span className="rounded-full border border-[rgba(173,145,124,0.14)] bg-[#fff8f3] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c9aa8d]">
                        {checkout.provider}
                      </span>
                      <span className="rounded-full border border-[rgba(173,145,124,0.14)] bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8d796d]">
                        {reconciliation?.paid ? "Paid" : "Pending"}
                      </span>
                    </div>

                    <p className="mx-auto mt-7 max-w-[300px] text-[13px] leading-7 text-[#8b776b]">
                      {provider === "SEPAY"
                        ? "Use SePay checkout or scan the generated code. Keep transfer content unchanged so the order can be matched automatically."
                        : "Use a VietQR-compatible banking app to scan and pay. Keep transfer content unchanged so the order can be matched automatically."}
                    </p>

                    <div className="mt-7 flex items-center justify-center gap-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ad8e7c]">
                      {checkout.checkoutUrl ? (
                        <Link
                          href={checkout.checkoutUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 transition-colors hover:text-[#8e6f5d]"
                        >
                          Open Link
                          <ExternalLink className="h-3.5 w-3.5" />
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
                        className="transition-colors hover:text-[#8e6f5d]"
                      >
                        Refresh Status
                      </button>
                    </div>

                    {(checkout.note || checkout.qrContent) ? (
                      <details className="mt-7 rounded-[22px] bg-[#fffaf6] px-5 py-4 text-left">
                        <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c9aa8d]">
                          Bank transfer details
                        </summary>
                        {checkout.note ? (
                          <p className="mt-4 text-[13px] leading-6 text-[#8b776b]">{checkout.note}</p>
                        ) : null}
                        {checkout.qrContent ? (
                          <p className="mt-3 break-all text-[12px] leading-6 text-[#6f5c50]">
                            {checkout.qrContent}
                          </p>
                        ) : null}
                      </details>
                    ) : null}
                  </div>
                </section>

                <aside className="order-3 xl:pt-10">
                  <div className="rounded-[34px] border border-[rgba(173,145,124,0.14)] bg-white px-7 py-8 shadow-[0_18px_55px_rgba(148,117,99,0.08)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#d0b59c]">
                      Order Total
                    </p>
                    <p
                      className="mt-5 text-[46px] leading-none text-[#8d6f5f]"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {formatCurrency(order.totalAmount)}
                    </p>

                    <div className="mt-8 space-y-4">
                      {items.slice(0, 2).map((item) => (
                        <article key={item.id} className="flex items-center gap-4">
                          <div className="relative h-14 w-14 overflow-hidden rounded-full bg-[#f2e8df]">
                            <Image
                              src={item.image}
                              alt={item.productName}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium text-[#6f5c50]">
                              {item.productName}
                            </p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#baa79b]">
                              Qty {item.quantity}
                            </p>
                          </div>
                          <p className="text-[12px] text-[#8b776b]">
                            {formatCurrency(item.subtotal)}
                          </p>
                        </article>
                      ))}
                    </div>

                    <div className="mt-8 border-t border-[#f2e7de] pt-7">
                      <div className="flex items-center gap-3">
                        <Clock3 className="h-5 w-5 text-[#d2a889]" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#d0b59c]">
                          Payment Status
                        </p>
                      </div>
                      <p
                        className="mt-4 text-[28px] leading-none text-[#4b3d35]"
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        {reconciliation?.paid ? "Payment received" : "Awaiting payment"}
                      </p>
                      <p className="mt-4 text-[13px] leading-7 text-[#8b776b]">
                        {reconciliation
                          ? `${reconciliation.transactionCount} transaction record(s) found.`
                          : "Waiting for reconciliation data."}
                      </p>
                      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c6a98f]">
                        Order #{order.id} • {formatOrderStatus(order.status)}
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
