"use client";

import Image from "next/image";
import Link from "next/link";
import { ProfileOrder } from "@/lib/profile/types";
import { type MessageKey } from "@/lib/i18n/messages";
import { formatCurrency } from "@/lib/currency";
import { useLocale } from "@/src/contexts";

interface ProfileOrderCardProps {
  order: ProfileOrder;
}

function getLocalizedOrderStatus(status: string, t: (key: MessageKey) => string): string {
  const normalizedStatus = status.trim().toLowerCase();

  if (normalizedStatus === "pending") {
    return t("profile.orders.status.pending");
  }
  if (normalizedStatus === "confirmed") {
    return t("profile.orders.status.confirmed");
  }
  if (normalizedStatus === "preparing") {
    return t("profile.orders.status.preparing");
  }
  if (normalizedStatus === "shipping") {
    return t("profile.orders.status.shipping");
  }
  if (normalizedStatus === "delivered") {
    return t("profile.orders.status.delivered");
  }
  if (normalizedStatus === "cancelled") {
    return t("profile.orders.status.cancelled");
  }

  return status;
}

export function ProfileOrderCard({ order }: ProfileOrderCardProps) {
  const { locale, t } = useLocale();
  const localizedStatus = getLocalizedOrderStatus(order.status, t);

  return (
    <article className="rounded-2xl bg-[rgba(255,255,255,0.4)] p-5 shadow-[inset_0px_1px_0px_rgba(255,255,255,0.6),inset_0px_-1px_0px_rgba(255,255,255,0.6)] backdrop-blur-sm sm:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
        <div className="relative h-32 w-24 overflow-hidden rounded-tl-[80px] rounded-tr-[80px] rounded-bl-[8px] rounded-br-[8px] bg-[#f7f3ed]">
          <Image
            src={order.image}
            alt={order.title}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#d0bb95]">
            {localizedStatus} {" - "} {order.date}
          </p>
          <h3
            className="mt-1 text-[20px] font-light leading-7 text-[#2d2a26]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            {order.title}
          </h3>
          <p className="mt-2 text-[14px] font-light leading-5 text-[#5c6b5e]">
            {order.description}
          </p>
        </div>

        <div className="md:text-right">
          <p
            className="text-[18px] font-light leading-7 text-[#2d2a26]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            {formatCurrency(order.price, locale)}
          </p>
          <Link
            href={order.href}
            className="mt-4 inline-flex text-[12px] font-bold tracking-[1.2px] text-[#d0bb95] transition-opacity hover:opacity-70"
          >
            {t("profile.orders.orderDetails")}
          </Link>
        </div>
      </div>
    </article>
  );
}
