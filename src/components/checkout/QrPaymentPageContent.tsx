"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
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
import { useAuth, useLocale } from "@/src/contexts";

function formatTimer(totalSeconds: number): string {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function calculateEarnedPoints(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  return Math.floor(amount / 1000);
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

export function QrPaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const { user, loading: authLoading } = useAuth();
  const providerLabel = "VietQR";
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
  const [hasCopiedPaymentCode, setHasCopiedPaymentCode] = useState(false);
  const orderId = Number(searchParams.get("orderId") || "0");
  const paymentCompleted =
    !!order &&
    (order.status === "CONFIRMED" ||
      reconciliation?.paid === true ||
      reconciliation?.orderStatus === "CONFIRMED");
  const earnedPoints = calculateEarnedPoints(order?.totalAmount ?? 0);
  const redeemedPoints = order?.redeemedPoints ?? 0;
  const rewardsDiscountAmount = order?.rewardsDiscountAmount ?? 0;

  const copy =
    locale === "vi"
      ? {
          signInTitle: "Dang nhap de tiep tuc",
          signInDesc:
            `${providerLabel} checkout duoc tao tu API thanh toan thuc va can phien dang nhap hop le.`,
          goToSignIn: "Den trang dang nhap",
          openingCompleteTitle: "Dang mo trang hoan tat",
          openingCompleteDesc: "Don hang #{id} da duoc xac nhan. He thong dang chuyen ban den giao dien hoan tat.",
          unavailableTitle: `${providerLabel} tam thoi khong kha dung`,
          unavailableDesc:
            `Hay tao don that truoc de nhan du lieu thanh toan ${providerLabel}.`,
          returnCheckout: "Quay lai thanh toan",
          header: `Hoan tat thanh toan ${providerLabel}`,
          waiting: "Dang cho xac nhan giao dich an toan",
          step1Title: "Quet VietQR",
          step1Desc: "Mo ung dung ngan hang va quet ma QR hien thi.",
          step2Title: "Xac thuc",
          step2Desc: "Xac nhan so tien va noi dung chuyen khoan chinh xac.",
          step3Title: "Thanh cong",
          step3Desc: "He thong se tu dong chuyen trang ngay khi phat hien thanh toan.",
          renderQrFailed: "Tam thoi khong the tao hinh QR.",
          expiry: "Han giao dich",
          validFor: "Con hieu luc {time}",
          paid: "Da thanh toan",
          pending: "Dang cho",
          instruction:
            "Su dung ung dung ngan hang ho tro VietQR de quet va thanh toan. Giu nguyen noi dung chuyen khoan de he thong doi soat tu dong.",
          amount: "So tien",
          paymentCode: "Ma thanh toan",
          copied: "Da sao chep",
          copy: "Sao chep",
          paymentCodeHint:
            "Nhap dung ma thanh toan vao noi dung chuyen khoan de he thong doi soat don hang tu dong.",
          openLink: "Mo lien ket",
          refreshStatus: "Lam moi trang thai",
          transferDetails: "Thong tin chuyen khoan",
          orderTotal: "Tong don hang",
          qty: "SL",
          paymentStatus: "Trang thai thanh toan",
          paymentReceivedStatus: "Da nhan thanh toan",
          awaitingPaymentStatus: "Dang cho thanh toan",
          transactionFound: "Tim thay {count} giao dich.",
          waitingReconcile: "Dang cho du lieu doi soat.",
          rewardsTitle: "Bloom Rewards",
          earned: "Diem nhan sau xac nhan",
          used: "Diem da dung trong don nay",
          discount: "Giam gia tu diem",
          formula:
            "Cong thuc hien tai: 1,000 VND thanh toan nhan 1 diem, va 1 diem giam 1,000 VND cho don tiep theo.",
          pointsUnit: "diem",
          orderPrefix: "Don #",
        }
      : {
          signInTitle: "Sign in to continue",
          signInDesc:
            `${providerLabel} checkout is generated from the real payment API and requires an authenticated session.`,
          goToSignIn: "Go to Sign In",
          openingCompleteTitle: "Opening completion page",
          openingCompleteDesc:
            "Order #{id} has been confirmed. We are redirecting you to the completion page now.",
          unavailableTitle: `${providerLabel} payment unavailable`,
          unavailableDesc:
            `Create a real order first to receive a ${providerLabel} checkout payload.`,
          returnCheckout: "Return to Checkout",
          header: `Complete Your ${providerLabel} Payment`,
          waiting: "Waiting For Secure Transaction Confirmation",
          step1Title: "Scan VietQR",
          step1Desc: "Use your banking app to scan the QR code shown here.",
          step2Title: "Authenticate",
          step2Desc: "Confirm the amount and transfer message exactly as provided.",
          step3Title: "Success",
          step3Desc: "Once payment is detected, we will move you to confirmation automatically.",
          renderQrFailed: "Unable to render QR image right now.",
          expiry: "Transaction Expiry",
          validFor: "Valid for {time}",
          paid: "Paid",
          pending: "Pending",
          instruction:
            "Use a VietQR-compatible banking app to scan and pay. Keep transfer content unchanged so the order can be matched automatically.",
          amount: "Amount",
          paymentCode: "Payment Code",
          copied: "Copied",
          copy: "Copy",
          paymentCodeHint:
            "Enter this payment code exactly in the transfer content so the payment can be matched to your order automatically.",
          openLink: "Open Link",
          refreshStatus: "Refresh Status",
          transferDetails: "Bank transfer details",
          orderTotal: "Order Total",
          qty: "Qty",
          paymentStatus: "Payment Status",
          paymentReceivedStatus: "Payment received",
          awaitingPaymentStatus: "Awaiting payment",
          transactionFound: "{count} transaction record(s) found.",
          waitingReconcile: "Waiting for reconciliation data.",
          rewardsTitle: "Bloom Rewards",
          earned: "Points earned after confirmation",
          used: "Points used on this order",
          discount: "Discount from rewards",
          formula:
            "Current formula: pay 1,000 VND to earn 1 point, and 1 point can reduce 1,000 VND on a future order.",
          pointsUnit: "pts",
          orderPrefix: "Order #",
        };

  const paymentSteps = [
    {
      label: locale === "vi" ? "BUOC 01" : "STEP 01",
      title: copy.step1Title,
      description: copy.step1Desc,
    },
    {
      label: locale === "vi" ? "BUOC 02" : "STEP 02",
      title: copy.step2Title,
      description: copy.step2Desc,
    },
    {
      label: locale === "vi" ? "BUOC 03" : "STEP 03",
      title: copy.step3Title,
      description: copy.step3Desc,
    },
  ] as const;

  const refreshPaymentStatus = useCallback(async () => {
    if (!user || orderId <= 0) {
      return;
    }

    try {
      const [nextOrder, nextReconciliation] = await Promise.all([
        ordersApi.getById(orderId),
        paymentsApi.reconcile(orderId),
      ]);

      setOrder(nextOrder);
      setReconciliation(nextReconciliation);
    } catch {
      return;
    }
  }, [orderId, user]);

  const handleRefreshStatus = useCallback(() => {
    window.location.reload();
  }, []);

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
        const [nextOrder, nextReconciliation] = await Promise.all([
          ordersApi.getById(orderId),
          paymentsApi.reconcile(orderId),
        ]);
        const isPaymentCompleted =
          nextOrder.status === "CONFIRMED" ||
          nextReconciliation.paid ||
          nextReconciliation.orderStatus === "CONFIRMED";
        const nextCheckout = isPaymentCompleted
          ? null
          : await paymentsApi.createVietQrCheckout(orderId);
        const productsById = await loadOrderProducts(
          nextOrder.items.map((item) => item.productId)
        );

        if (!active) {
          return;
        }

        setOrder(nextOrder);
        setCheckout(nextCheckout);
        setReconciliation(nextReconciliation);
        setRemainingSeconds(nextCheckout?.expiresInSeconds ?? 0);
        setItems(
          nextOrder.items.map((item) => mapOrderItemToDisplay(item, productsById[item.productId]))
        );
      } catch (fetchError) {
        if (!active) {
          return;
        }

        try {
          const [latestOrder, latestReconciliation] = await Promise.all([
            ordersApi.getById(orderId),
            paymentsApi.reconcile(orderId),
          ]);
          const isPaymentCompleted =
            latestOrder.status === "CONFIRMED" ||
            latestReconciliation.paid ||
            latestReconciliation.orderStatus === "CONFIRMED";

          if (isPaymentCompleted) {
            setOrder(latestOrder);
            setCheckout(null);
            setReconciliation(latestReconciliation);
            setRemainingSeconds(0);
            setError(null);
            return;
          }
        } catch {
          // Fall through to the unavailable state below if recovery also fails.
        }

        setOrder(null);
        setCheckout(null);
        setReconciliation(null);
        setItems([]);
        setError(
          isApiError(fetchError)
            ? fetchError.message
            : (locale === "vi"
                ? `Khong the tai trang thanh toan ${providerLabel} luc nay.`
                : `Unable to load ${providerLabel} checkout right now.`)
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
  }, [authLoading, locale, orderId, providerLabel, user]);

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
    if (!user || orderId <= 0 || paymentCompleted) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refreshPaymentStatus();
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [orderId, paymentCompleted, refreshPaymentStatus, user]);

  useEffect(() => {
    if (!paymentCompleted || !order || isRedirecting) {
      return;
    }

    setIsRedirecting(true);

    router.replace(`/checkout/complete?orderId=${order.id}`);
  }, [isRedirecting, order, paymentCompleted, router]);

  useEffect(() => {
    if (!hasCopiedPaymentCode) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setHasCopiedPaymentCode(false);
    }, 1800);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [hasCopiedPaymentCode]);

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
          ) : paymentCompleted && order ? (
            <div className="mx-auto max-w-[760px]">
              <QrStateCard
                title={copy.openingCompleteTitle}
                description={copy.openingCompleteDesc.replace("{id}", String(order.id))}
              />
            </div>
          ) : !order || !checkout ? (
            <div className="mx-auto max-w-[760px]">
              <QrStateCard
                title={copy.unavailableTitle}
                description={error ?? copy.unavailableDesc}
                action={
                  <Link
                    href="/checkout"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#a88672] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#916f5b]"
                  >
                    {copy.returnCheckout}
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
                  {copy.header}
                </h1>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.38em] text-[#d0b59c]">
                  {copy.waiting}
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
                            {copy.renderQrFailed}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-7">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#d0b59c]">
                        {copy.expiry}
                      </p>
                      <p
                        className="mt-3 text-[34px] leading-none text-[#6d5649]"
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        {copy.validFor.replace("{time}", formatTimer(remainingSeconds))}
                      </p>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-3">
                      <span className="rounded-full border border-[rgba(173,145,124,0.14)] bg-[#fff8f3] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c9aa8d]">
                        {checkout.provider}
                      </span>
                      <span className="rounded-full border border-[rgba(173,145,124,0.14)] bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8d796d]">
                        {paymentCompleted ? copy.paid : copy.pending}
                      </span>
                    </div>

                    <p className="mx-auto mt-7 max-w-[300px] text-[13px] leading-7 text-[#8b776b]">
                      {copy.instruction}
                    </p>

                    <div className="mt-7 rounded-[24px] bg-[#fffaf6] px-5 py-5 text-left">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c9aa8d]">
                            {copy.amount}
                          </p>
                          <p
                            className="mt-2 text-[26px] leading-none text-[#6d5649]"
                            style={{ fontFamily: "var(--font-cormorant)" }}
                          >
                            {formatCurrency(order.totalAmount, locale)}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c9aa8d]">
                                {copy.paymentCode}
                              </p>
                              <p
                                className="mt-2 break-all text-[22px] leading-none text-[#4b3d35]"
                                style={{ fontFamily: "var(--font-cormorant)" }}
                              >
                                {checkout.transactionId}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(checkout.transactionId);
                                  setHasCopiedPaymentCode(true);
                                } catch {
                                  return;
                                }
                              }}
                              className="shrink-0 rounded-full border border-[rgba(173,145,124,0.18)] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8d796d] transition-colors hover:border-[#c9aa8d] hover:text-[#6f5c50]"
                            >
                              {hasCopiedPaymentCode ? copy.copied : copy.copy}
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 text-[12px] leading-6 text-[#8b776b]">
                        {copy.paymentCodeHint}
                      </p>
                    </div>

                    <div className="mt-7 flex items-center justify-center gap-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ad8e7c]">
                      {checkout.checkoutUrl ? (
                        <Link
                          href={checkout.checkoutUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 transition-colors hover:text-[#8e6f5d]"
                        >
                          {copy.openLink}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleRefreshStatus}
                        className="transition-colors hover:text-[#8e6f5d]"
                      >
                        {copy.refreshStatus}
                      </button>
                    </div>

                    {(checkout.note || checkout.qrContent) ? (
                      <details className="mt-7 rounded-[22px] bg-[#fffaf6] px-5 py-4 text-center">
                        <summary className="cursor-pointer list-none text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c9aa8d]">
                          {copy.transferDetails}
                        </summary>
                        {checkout.note ? (
                          <p className="mx-auto mt-4 max-w-[320px] text-[13px] leading-6 text-[#8b776b]">
                            {checkout.note}
                          </p>
                        ) : null}
                        {checkout.qrContent ? (
                          <p className="mx-auto mt-3 max-w-[320px] break-all text-[12px] leading-6 text-[#6f5c50]">
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
                      {copy.orderTotal}
                    </p>
                    <p
                      className="mt-5 text-[46px] leading-none text-[#8d6f5f]"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {formatCurrency(order.totalAmount, locale)}
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
                              {copy.qty} {item.quantity}
                            </p>
                          </div>
                          <p className="text-[12px] text-[#8b776b]">
                            {formatCurrency(item.subtotal, locale)}
                          </p>
                        </article>
                      ))}
                    </div>

                    <div className="mt-8 border-t border-[#f2e7de] pt-7">
                      <div className="flex items-center gap-3">
                        <Clock3 className="h-5 w-5 text-[#d2a889]" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#d0b59c]">
                          {copy.paymentStatus}
                        </p>
                      </div>
                      <p
                        className="mt-4 text-[28px] leading-none text-[#4b3d35]"
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        {paymentCompleted ? copy.paymentReceivedStatus : copy.awaitingPaymentStatus}
                      </p>
                      <p className="mt-4 text-[13px] leading-7 text-[#8b776b]">
                        {reconciliation
                          ? copy.transactionFound.replace("{count}", String(reconciliation.transactionCount))
                          : copy.waitingReconcile}
                      </p>
                      <div className="mt-6 rounded-[20px] bg-[#fcf7f2] px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c6a98f]">
                          {copy.rewardsTitle}
                        </p>
                        <div className="mt-3 space-y-3 text-[13px] text-[#7f6d61]">
                          <div className="flex items-center justify-between gap-3">
                            <span>{copy.earned}</span>
                            <span className="font-semibold text-[#166534]">+{earnedPoints} {copy.pointsUnit}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span>{copy.used}</span>
                            <span className="font-semibold text-[#8d796d]">{redeemedPoints} {copy.pointsUnit}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span>{copy.discount}</span>
                            <span className="font-semibold text-[#166534]">
                              -{formatCurrency(rewardsDiscountAmount, locale)}
                            </span>
                          </div>
                        </div>
                        <p className="mt-3 text-[12px] leading-6 text-[#a08d82]">
                          {copy.formula}
                        </p>
                      </div>
                      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c6a98f]">
                        {copy.orderPrefix}{order.id} • {formatOrderStatus(order.status, locale)}
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
