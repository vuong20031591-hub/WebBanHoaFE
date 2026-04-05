"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import { isApiError, ordersApi } from "@/lib/api";
import { loadOrderProducts, mapOrderToProfileOrder } from "@/lib/mappers";
import { ProfileOrder } from "@/lib/profile/types";
import { useAuth, useLocale } from "@/src/contexts";
import { ProfileOrdersSection } from "./ProfileOrdersSection";
import { ProfileTabs } from "./ProfileTabs";

function ProfileStateCard({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[32px] bg-white/60 px-8 py-10 text-center">
      <h2
        className="text-[32px] leading-[1.1] text-[#2d2a26]"
        style={{ fontFamily: "var(--font-noto-serif)" }}
      >
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-[520px] text-[14px] leading-6 text-[#5c6b5e]">
        {description}
      </p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}

export function ProfilePageContent() {
  const { locale, t } = useLocale();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setIsLoadingOrders(false);
      setOrders([]);
      return;
    }

    let active = true;

    const loadOrders = async () => {
      setIsLoadingOrders(true);
      setError(null);

      try {
        const data = await ordersApi.getAll();
        const productsById = await loadOrderProducts(
          data.flatMap((order) => order.items.map((item) => item.productId))
        );

        if (!active) {
          return;
        }

        setOrders(data.map((order) => mapOrderToProfileOrder(order, productsById, locale)));
      } catch (fetchError) {
        if (!active) {
          return;
        }

        setOrders([]);
        setError(
          isApiError(fetchError)
            ? fetchError.message
            : t("profile.orders.unableToLoadFallback")
        );
      } finally {
        if (active) {
          setIsLoadingOrders(false);
        }
      }
    };

    loadOrders();

    return () => {
      active = false;
    };
  }, [authLoading, locale, t, user]);

  const profileTabs = [
    { id: "orders", label: t("profile.orders.tabOrders"), href: "/profile", active: true },
    {
      id: "favorites",
      label: t("profile.orders.tabFavorites"),
      href: "/profile/favorites",
      active: false,
    },
    {
      id: "settings",
      label: t("profile.orders.tabSettings"),
      href: "/profile/settings",
      active: false,
    },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f7f3ed]">
      <Navbar />
      <main className="pb-24">
        <div className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-6 lg:px-10 lg:pt-24">
          <div className="mx-auto max-w-[1100px]">
            <header className="pb-12 lg:pb-16">
              <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-[#d0bb95]">
                {t("profile.settings.accountBadge")}
              </p>
              <h1
                className="mt-4 text-[44px] font-light leading-none text-[#2d2a26]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                {t("profile.orders.title")}
              </h1>
              <p className="mt-3 text-[14px] leading-6 text-[#5c6b5e]">
                {t("profile.orders.subtitle")}
              </p>
            </header>

            <ProfileTabs tabs={[...profileTabs]} />

            {authLoading || isLoadingOrders ? (
              <div className="mt-12 h-[320px] rounded-[32px] bg-white/60 animate-pulse" />
            ) : !user ? (
              <div className="pt-12 lg:pt-16">
                <ProfileStateCard
                  title={t("profile.orders.signInTitle")}
                  description={t("profile.orders.signInSubtitle")}
                  action={
                    <Link
                      href="/signin"
                      className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#d0bb95] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571]"
                    >
                      {t("profile.common.goToSignIn")}
                    </Link>
                  }
                />
              </div>
            ) : error ? (
              <div className="pt-12 lg:pt-16">
                <ProfileStateCard
                  title={t("profile.orders.loadErrorTitle")}
                  description={error}
                />
              </div>
            ) : (
              <ProfileOrdersSection orders={orders} />
            )}
          </div>
        </div>
      </main>
      <Footer />
      <ChatLive />
    </div>
  );
}
