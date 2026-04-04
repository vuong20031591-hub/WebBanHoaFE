"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode, useEffect, useMemo } from "react";
import {
  ClipboardList,
  Flower2,
  LayoutDashboard,
  Package2,
  Search,
  Settings,
  ShoppingCart,
  SquareMenu,
  User,
  Users,
} from "lucide-react";
import { adminOrdersApi, isApiError } from "@/lib/api";
import type { AdminOrderStatsDTO, OrderDTO } from "@/lib/api/types";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/src/contexts";
import { loadOrderProducts } from "@/lib/mappers";

interface MetricCard {
  id: string;
  eyebrow: string;
  value: string;
  description: string;
  accent?: "default" | "green";
}

interface OrderRow {
  id: string;
  arrangement: string;
  variant: string;
  recipient: string;
  deliveryDate: string;
  status: string;
  statusTone: "champagne" | "green" | "stone";
  value: string;
  image: string;
}

const FALLBACK_IMAGE = "/images/hero-main.png";

function DashboardStateCard({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#d8d4d4] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-[980px] rounded-[24px] border border-[#ebe5de] bg-[#fbfaf8] px-8 py-16 text-center">
        <h1
          className="text-[38px] leading-[1.1] text-[#2d2a26]"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-[560px] text-[15px] leading-7 text-[#5c6b5e]">
          {description}
        </p>
        {action ? <div className="mt-9">{action}</div> : null}
      </div>
    </div>
  );
}

function MetricSummaryCard({ card }: { card: MetricCard }) {
  const isGreen = card.accent === "green";

  return (
    <article
      className={`relative overflow-hidden rounded-[14px] border px-5 py-4 ${
        isGreen
          ? "border-[#cfe0c7] bg-[#cfe2c7]"
          : "border-[#ece5de] bg-[#fffdfa]"
      }`}
    >
      <p className="text-[10px] uppercase tracking-[1.6px] text-[#8f877f]">
        {card.eyebrow}
      </p>
      <p className="mt-4 text-[47px] leading-none text-[#2d2a26]">{card.value}</p>
      <p className="mt-2 text-[12px] text-[#7f776f]">{card.description}</p>
      <div className="pointer-events-none absolute bottom-0 right-0 h-20 w-20 translate-x-4 translate-y-4 rounded-full border-[10px] border-[#efe7df] opacity-60" />
    </article>
  );
}

function formatCustomerLabel(userId: string): string {
  if (!userId) {
    return "Unknown";
  }

  if (userId.includes("@")) {
    const [namePart] = userId.split("@");
    return namePart
      .split(/[._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment[0].toUpperCase() + segment.slice(1))
      .join(" ");
  }

  if (userId.length <= 14) {
    return userId;
  }

  return `${userId.slice(0, 6)}...${userId.slice(-4)}`;
}

function getOrderDisplayInfo(status: string): {
  label: string;
  tone: OrderRow["statusTone"];
} {
  switch (status) {
    case "PENDING":
      return { label: "HAND-CURATING", tone: "champagne" };
    case "CONFIRMED":
      return { label: "DELIVERED", tone: "green" };
    case "CANCELLED":
      return { label: "CANCELLED", tone: "stone" };
    default:
      return { label: status, tone: "stone" };
  }
}

function getStatusClassName(tone: OrderRow["statusTone"]) {
  switch (tone) {
    case "green":
      return "bg-[#dbe8cd] text-[#667e42]";
    case "stone":
      return "bg-[#ebe7e1] text-[#7d746c]";
    default:
      return "bg-[#ead3be] text-[#9b6a3c]";
  }
}

export function AdminOrdersPageContent() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [stats, setStats] = useState<AdminOrderStatsDTO | null>(null);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [productsById, setProductsById] = useState<
    Record<number, { image?: string | null }>
  >({});
  const [contentLoading, setContentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/signin");
    } finally {
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    if (loading || !isAdmin) {
      if (!loading && (!user || !isAdmin)) {
        setContentLoading(false);
      }
      return;
    }

    let active = true;

    const loadData = async () => {
      setContentLoading(true);
      setError(null);
      try {
        const [statsData, ordersPage] = await Promise.all([
          adminOrdersApi.getStats(),
          adminOrdersApi.getOrders({ page: 0, size: 10, sortBy: "createdAt", sortDir: "DESC" }),
        ]);

        const recentOrders = ordersPage.content;

        const firstItemProductIds = recentOrders
          .map((order) => order.items[0]?.productId)
          .filter((value): value is number => typeof value === "number");

        const products =
          firstItemProductIds.length > 0 ? await loadOrderProducts(firstItemProductIds) : {};

        if (!active) return;

        setStats(statsData);
        setOrders(recentOrders);
        setProductsById(products);
      } catch (err) {
        if (!active) return;
        setError(isApiError(err) ? err.message : "Failed to load order data.");
      } finally {
        if (active) {
          setContentLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [loading, isAdmin, user]);

  const metricCards: MetricCard[] = useMemo(() => {
    if (!stats) return [];
    return [
      {
        id: "pending",
        eyebrow: "IN ARRANGEMENT",
        value: String(stats.pendingOrders).padStart(2, "0"),
        description: "Active arrangements",
      },
      {
        id: "confirmed",
        eyebrow: "DELIVERED",
        value: String(stats.confirmedOrders).padStart(2, "0"),
        description: "Completed commissions",
        accent: "green",
      },
      {
        id: "cancelled",
        eyebrow: "CANCELLED",
        value: String(stats.cancelledOrders).padStart(2, "0"),
        description: "Cancelled orders",
      },
    ];
  }, [stats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#d8d4d4] p-3 md:p-7">
        <div className="mx-auto h-[760px] max-w-[1320px] animate-pulse rounded-[3px] bg-[#fbfaf8]" />
      </div>
    );
  }

  if (!user) {
    return (
      <DashboardStateCard
        title="Sign in to view order management"
        description="This admin page is available only for authenticated users."
        action={
          <Link
            href="/signin"
            className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#8d6030] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#7a542a]"
          >
            Go to Sign In
          </Link>
        }
      />
    );
  }

  if (!isAdmin) {
    return (
      <DashboardStateCard
        title="Admin access required"
        description="Your account does not have permission to open the order management workspace."
        action={
          <Link
            href="/"
            className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] border border-[#d6cbc0] px-8 text-[14px] font-medium text-[#6d5742] transition-colors hover:bg-[#f5efe8]"
          >
            Back to Store
          </Link>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#d8d4d4] p-3 md:p-7">
      <div className="mx-auto overflow-hidden rounded-[3px] border border-[#e9e3dc] bg-[#fbfaf8]">
        <header className="flex flex-col gap-4 border-b border-[#eee8e1] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-7">
          <div className="flex flex-wrap items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Flower2 className="h-4 w-4 text-[#c8a16a]" />
              <span
                className="text-[21px] text-[#2d2a26]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                Floral Boutique
              </span>
            </Link>
            <div className="flex items-center gap-6 text-[13px] text-[#4d473f]">
              <Link href="/products" className="transition-colors hover:text-[#8d6030]">
                Shop All
              </Link>
              <Link
                href="/products?view=categories"
                className="transition-colors hover:text-[#8d6030]"
              >
                Categories
              </Link>
              <Link
                href="/products?sort=latest"
                className="transition-colors hover:text-[#8d6030]"
              >
                Latest
              </Link>
              <Link href="/our-story" className="transition-colors hover:text-[#8d6030]">
                Our Story
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-[230px] items-center rounded-full bg-[#f2eeea] px-4">
              <Search className="h-3.5 w-3.5 text-[#a8a09a]" />
              <span className="ml-2 text-[12px] text-[#b3aba4]">
                Search arrangements...
              </span>
            </div>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#3f3934] transition-colors hover:bg-[#f2eeea]"
              aria-label="Cart"
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
            </button>
            <div className="relative group">
              <Link
                href="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#3f3934] transition-colors hover:bg-[#f2eeea]"
                aria-label="Profile"
              >
                <User className="h-[18px] w-[18px]" />
              </Link>
              <div className="pointer-events-none invisible absolute right-0 top-[calc(100%+8px)] z-50 w-[132px] translate-y-1 rounded-[12px] border border-[#e5ddd4] bg-[#fcfaf7] p-1 opacity-0 shadow-sm transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full rounded-[9px] px-3 py-2 text-left text-[12px] font-medium text-[#5b4f43] transition-colors hover:bg-[#f1eeea] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSigningOut ? "Đang thoát..." : "Đăng xuất"}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="border-b border-[#eee8e1] px-4 py-6 md:min-h-[720px] md:border-b-0 md:border-r md:border-[#eee8e1] md:px-5">
            <nav className="space-y-1.5">
              <Link
                href="/admin"
                className="flex w-full items-center gap-3 rounded-r-full rounded-l-[6px] px-4 py-3 text-left text-[13px] text-[#4a433c] transition-colors hover:bg-[#f1ede7]"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/orders"
                className="flex w-full items-center gap-3 rounded-r-full rounded-l-[6px] bg-[#9b6a31] px-4 py-3 text-left text-[13px] text-white transition-colors"
              >
                <ClipboardList className="h-4 w-4" />
                <span>Orders</span>
              </Link>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-r-full rounded-l-[6px] px-4 py-3 text-left text-[13px] text-[#4a433c] transition-colors hover:bg-[#f1ede7]"
              >
                <Package2 className="h-4 w-4" />
                <span>Products</span>
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-r-full rounded-l-[6px] px-4 py-3 text-left text-[13px] text-[#4a433c] transition-colors hover:bg-[#f1ede7]"
              >
                <Users className="h-4 w-4" />
                <span>Customers</span>
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-r-full rounded-l-[6px] px-4 py-3 text-left text-[13px] text-[#4a433c] transition-colors hover:bg-[#f1ede7]"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </nav>

            <div className="mt-14 hidden items-center gap-3 md:flex">
              <div className="h-10 w-10 rounded-full bg-[#ece8e3]" />
              <div>
                <p className="text-[12px] font-medium text-[#3f3934]">
                  {user.fullName || "Minh Quỳnh"}
                </p>
                <p className="text-[10px] uppercase tracking-[1.2px] text-[#b2aaa2]">
                  Head Florist
                </p>
              </div>
            </div>
          </aside>

          <main className="px-4 py-7 md:px-7">
            {contentLoading ? (
              <>
                <div className="h-[128px] w-full animate-pulse rounded-[18px] bg-[#f0ece7]" />
                <div className="mt-8 h-[400px] w-full animate-pulse rounded-[18px] bg-[#f0ece7]" />
              </>
            ) : error ? (
              <div className="rounded-[18px] border border-[#efd0cc] bg-[#fbefec] px-5 py-4 text-center text-[14px] text-[#8f3d35]">
                <h3 className="font-semibold">Could not load order data</h3>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            ) : (
              <>
                <section>
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h1
                        className="text-[46px] leading-[1.04] text-[#2d2a26]"
                        style={{ fontFamily: "var(--font-noto-serif)" }}
                      >
                        Order Boutique
                      </h1>
                      <p className="mt-1 text-[18px] italic text-[#9a8f86]">
                        The Atelier Curator.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e2db] bg-white text-[#5d554d] transition-colors hover:bg-[#f6f2ed]"
                        aria-label="Search orders"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center rounded-full bg-[#9b6a31] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#855927]"
                      >
                        + New Commission
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 lg:grid-cols-3">
                    {metricCards.map((card) => (
                      <MetricSummaryCard key={card.id} card={card} />
                    ))}
                  </div>
                </section>

                <section className="mt-8 rounded-[18px] border border-[#ece5de] bg-white">
                  <div className="flex flex-col gap-4 border-b border-[#f1ebe4] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <h2
                      className="text-[29px] leading-none text-[#2d2a26]"
                      style={{ fontFamily: "var(--font-noto-serif)" }}
                    >
                      Recent Commissions
                    </h2>

                    <div className="flex items-center gap-2 text-[11px] text-[#8d847c]">
                      <button
                        type="button"
                        className="rounded-full border border-[#e8e0d7] bg-[#faf7f3] px-3 py-1.5"
                      >
                        All Status
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-[#e8e0d7] bg-[#faf7f3] px-3 py-1.5"
                      >
                        This Week
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left text-[11px] text-[#9c938a]">
                          <th className="px-5 py-4 font-medium">Arrangement</th>
                          <th className="px-3 py-4 font-medium">Recipient</th>
                          <th className="px-3 py-4 font-medium">Delivery Date</th>
                          <th className="px-3 py-4 font-medium">Status</th>
                          <th className="px-5 py-4 text-right font-medium">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-5 py-12 text-center text-[13px] text-[#8f877f]"
                            >
                              No recent commissions to display.
                            </td>
                          </tr>
                        ) : (
                          orders.map((order) => {
                            const firstItem = order.items[0];
                            const displayInfo = getOrderDisplayInfo(order.status);
                            const image =
                              firstItem?.productId && productsById[firstItem.productId]?.image
                                ? productsById[firstItem.productId].image
                                : FALLBACK_IMAGE;

                            return (
                              <tr
                                key={order.id}
                                className="border-t border-[#f5efe8] text-[13px] text-[#3d3731]"
                              >
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="h-12 w-12 rounded-[10px] bg-cover bg-center bg-no-repeat"
                                      style={{ backgroundImage: `url(${image ?? ""})` }}
                                    />
                                    <div>
                                      <p className="font-medium text-[#2f2925]">
                                        {firstItem?.productName ?? `Order #${order.id}`}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-4 text-[#5f5750]">
                                  {formatCustomerLabel(order.userId)}
                                </td>
                                <td className="px-3 py-4 text-[#5f5750]">
                                  {new Intl.DateTimeFormat("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  }).format(new Date(order.createdAt))}
                                </td>
                                <td className="px-3 py-4">
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.8px] ${getStatusClassName(displayInfo.tone)}`}
                                  >
                                    {displayInfo.label}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-right font-medium text-[#2f2925]">
                                  {formatCurrency(order.totalAmount)}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-center px-5 py-5">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-[12px] font-medium text-[#766d64] transition-colors hover:text-[#5d534b]"
                    >
                      View Complete Order History
                      <SquareMenu className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
