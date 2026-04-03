"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ClipboardList,
  DollarSign,
  Flower2,
  LayoutDashboard,
  Megaphone,
  MoreHorizontal,
  Package2,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Star,
  User,
  Users,
} from "lucide-react";
import { adminOrdersApi, isApiError, productsApi } from "@/lib/api";
import type { AdminOrderStatsDTO, OrderDTO, ProductDTO } from "@/lib/api/types";
import { formatCurrency } from "@/lib/currency";
import { loadOrderProducts } from "@/lib/mappers";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/mappers/product";
import { useAuth } from "@/src/contexts";

const WEEKDAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
const LOW_STOCK_THRESHOLD = 15;
const FALLBACK_IMAGE = DEFAULT_PRODUCT_IMAGE;

function formatDashboardCurrency(value: number): string {
  const safeValue = Number.isFinite(value) ? Math.round(value) : 0;
  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(safeValue)}đ`;
}

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

function getWeekStart(date: Date): Date {
  const weekStart = new Date(date);
  weekStart.setHours(0, 0, 0, 0);
  const dayIndex = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - dayIndex);
  return weekStart;
}

function getWeekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function computeWeeklyRevenue(orders: OrderDTO[]): number[] {
  const weekStart = getWeekStart(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  const totals = new Array<number>(7).fill(0);

  for (const order of orders) {
    if (order.status === "CANCELLED") {
      continue;
    }

    const createdAt = new Date(order.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      continue;
    }

    if (createdAt < weekStart || createdAt >= weekEnd) {
      continue;
    }

    totals[getWeekdayIndex(createdAt)] += order.totalAmount;
  }

  return totals;
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

function formatOrderStatus(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "DELIVERED";
    case "PENDING":
      return "PENDING";
    case "CANCELLED":
      return "CANCELLED";
    default:
      return status;
  }
}

function getOrderStatusClassName(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "bg-[#dde8d4] text-[#3f6a33]";
    case "PENDING":
      return "bg-[#f3ebd6] text-[#936f2a]";
    case "CANCELLED":
      return "bg-[#f6dada] text-[#a43737]";
    default:
      return "bg-[#e8e5e1] text-[#6b6460]";
  }
}

export function AdminDashboardPageContent() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [stats, setStats] = useState<AdminOrderStatsDTO | null>(null);
  const [ordersWindow, setOrdersWindow] = useState<OrderDTO[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<ProductDTO[]>([]);
  const [coverByOrderId, setCoverByOrderId] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

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
    if (authLoading) {
      return;
    }

    if (!user || !isAdmin) {
      setLoading(false);
      setError(null);
      setStats(null);
      setOrdersWindow([]);
      setLowStockProducts([]);
      setCoverByOrderId({});
      return;
    }

    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const [statsData, ordersPage, productsPage] = await Promise.all([
          adminOrdersApi.getStats(),
          adminOrdersApi.getOrders({
            page: 0,
            size: 60,
            sortBy: "createdAt",
            sortDir: "DESC",
          }),
          productsApi.search({
            page: 0,
            size: 100,
            sort: "id,asc",
          }),
        ]);

        const recentOrders = ordersPage.content.slice(0, 5);
        const lowStock = productsPage.content
          .filter(
            (product) =>
              typeof product.stockQuantity === "number" &&
              product.stockQuantity > 0 &&
              product.stockQuantity <= LOW_STOCK_THRESHOLD
          )
          .sort((first, second) => {
            const firstStock = first.stockQuantity ?? LOW_STOCK_THRESHOLD;
            const secondStock = second.stockQuantity ?? LOW_STOCK_THRESHOLD;
            return firstStock - secondStock;
          })
          .slice(0, 5);

        const firstItemProductIds = recentOrders
          .map((order) => order.items[0]?.productId)
          .filter((value): value is number => typeof value === "number");
        const productsById =
          firstItemProductIds.length > 0
            ? await loadOrderProducts(firstItemProductIds)
            : {};

        if (!active) {
          return;
        }

        setStats(statsData);
        setOrdersWindow(ordersPage.content);
        setLowStockProducts(lowStock);
        setCoverByOrderId(
          Object.fromEntries(
            recentOrders.map((order) => {
              const firstProductId = order.items[0]?.productId;
              const image =
                firstProductId && productsById[firstProductId]?.image
                  ? productsById[firstProductId].image
                  : FALLBACK_IMAGE;
              return [order.id, image];
            })
          )
        );
      } catch (loadError) {
        if (!active) {
          return;
        }

        setStats(null);
        setOrdersWindow([]);
        setLowStockProducts([]);
        setCoverByOrderId({});
        setError(
          isApiError(loadError)
            ? loadError.message
            : "Unable to load admin dashboard right now."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [authLoading, isAdmin, user]);

  const recentOrders = useMemo(() => ordersWindow.slice(0, 5), [ordersWindow]);
  const weeklyRevenue = useMemo(() => computeWeeklyRevenue(ordersWindow), [ordersWindow]);
  const weekPeakRevenue = useMemo(() => Math.max(...weeklyRevenue, 1), [weeklyRevenue]);

  const totalRevenue = useMemo(
    () =>
      ordersWindow.reduce(
        (sum, order) => (order.status === "CANCELLED" ? sum : sum + order.totalAmount),
        0
      ),
    [ordersWindow]
  );

  const averageOrderValue = useMemo(() => {
    const validOrderCount = ordersWindow.filter((order) => order.status !== "CANCELLED").length;
    if (validOrderCount === 0) {
      return 0;
    }
    return totalRevenue / validOrderCount;
  }, [ordersWindow, totalRevenue]);

  const satisfactionRate = useMemo(() => {
    const delivered = stats?.confirmedOrders ?? 0;
    const cancelled = stats?.cancelledOrders ?? 0;
    const tracked = delivered + cancelled;
    if (tracked === 0) {
      return 100;
    }
    return (delivered / tracked) * 100;
  }, [stats]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#d8d4d4] px-4 py-10 md:px-8">
        <div className="mx-auto h-[640px] max-w-[1320px] animate-pulse rounded-[24px] bg-[#fbfaf8]" />
      </div>
    );
  }

  if (!user) {
    return (
      <DashboardStateCard
        title="Sign in to view admin dashboard"
        description="Dashboard data is only available for authenticated administrators."
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
        description="Your account does not have permission to open this dashboard. Please contact an administrator."
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
      <div className="mx-auto max-w-[1320px] overflow-hidden rounded-[3px] border border-[#e9e3dc] bg-[#fbfaf8]">
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
              <span className="ml-2 text-[12px] text-[#b3aba4]">Search arrangements...</span>
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

        <div className="grid md:grid-cols-[218px_minmax(0,1fr)]">
          <aside className="border-b border-[#eee8e1] px-4 py-6 md:min-h-[720px] md:border-b-0 md:border-r md:border-[#eee8e1] md:px-5">
            <nav className="space-y-2">
              {[
                { icon: LayoutDashboard, label: "Dashboard", href: "/admin", active: true },
                { icon: ClipboardList, label: "Orders", href: "/admin/orders", active: false },
                { icon: Package2, label: "Products", href: "/admin/products", active: false },
                { icon: Users, label: "Customers", active: false },
                { icon: Megaphone, label: "Marketing", active: false },
                { icon: Settings, label: "Settings", active: false },
              ].map((item) => {
                const className = `flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-[13px] transition-colors ${
                  item.active
                    ? "bg-[#8d6030] text-white"
                    : "text-[#4a433c] hover:bg-[#f1ede7]"
                }`;

                if (item.href) {
                  return (
                    <Link key={item.label} href={item.href} className={className}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                }

                return (
                  <button key={item.label} type="button" className={className}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-14 hidden items-center gap-3 md:flex">
              <div className="h-10 w-10 rounded-full bg-[#ece8e3]" />
              <div>
                <p className="text-[12px] font-medium text-[#3f3934]">{user.fullName}</p>
                <p className="text-[10px] uppercase tracking-[1.2px] text-[#b2aaa2]">Head Florist</p>
              </div>
            </div>
          </aside>

          <main className="px-4 py-7 md:px-7">
            {loading ? (
              <div className="grid gap-4">
                <div className="h-32 animate-pulse rounded-[18px] bg-[#f0ece7]" />
                <div className="h-64 animate-pulse rounded-[18px] bg-[#f0ece7]" />
              </div>
            ) : error ? (
              <div className="rounded-[18px] border border-[#efd0cc] bg-[#fbefec] px-5 py-4 text-[14px] text-[#8f3d35]">
                {error}
              </div>
            ) : (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
                <section className="space-y-5">
                  <header>
                    <h1
                      className="text-[46px] leading-[1.04] text-[#2d2a26]"
                      style={{ fontFamily: "var(--font-noto-serif)" }}
                    >
                      Bonjour, {user.fullName}
                    </h1>
                    <p className="mt-2 text-[13px] text-[#857d76]">
                      The Atelier is buzzing today with{" "}
                      <span className="font-medium text-[#5e564f]">{stats?.pendingOrders ?? 0}</span>{" "}
                      new deliveries scheduled.
                    </p>
                  </header>

                  <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                    <article className="rounded-[14px] border border-[#efe9e2] bg-[#fdfcfa] px-4 py-4">
                      <div className="flex items-center justify-between">
                        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f1dcc7] text-[#94663a]">
                          <DollarSign className="h-4 w-4" />
                        </span>
                        <span className="text-[10px] text-[#a99786]">+12.5% vs LW</span>
                      </div>
                      <p className="mt-3 text-[10px] uppercase tracking-[1.3px] text-[#beb2a6]">
                        Total Revenue
                      </p>
                      <p className="mt-1 max-w-[145px] whitespace-normal break-all text-[26px] leading-[1.05] text-[#312c27] md:text-[28px] 2xl:max-w-[170px] 2xl:text-[32px]">
                        {formatDashboardCurrency(totalRevenue)}
                      </p>
                    </article>

                    <article className="rounded-[14px] border border-[#efe9e2] bg-[#fdfcfa] px-4 py-4">
                      <div className="flex items-center justify-between">
                        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#dce9d2] text-[#5b7848]">
                          <ShoppingBag className="h-4 w-4" />
                        </span>
                        <span className="text-[10px] text-[#a99786]">{stats?.totalOrders ?? 0} total</span>
                      </div>
                      <p className="mt-3 text-[10px] uppercase tracking-[1.3px] text-[#beb2a6]">
                        New Orders
                      </p>
                      <p className="mt-1 text-[32px] leading-[1] text-[#312c27]">
                        {stats?.pendingOrders ?? 0}
                      </p>
                    </article>

                    <article className="rounded-[14px] border border-[#efe9e2] bg-[#fdfcfa] px-4 py-4">
                      <div className="flex items-center justify-between">
                        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#ebddd0] text-[#9f7552]">
                          <Package2 className="h-4 w-4" />
                        </span>
                        <span className="text-[10px] text-[#a99786]">Current snapshot</span>
                      </div>
                      <p className="mt-3 text-[10px] uppercase tracking-[1.3px] text-[#beb2a6]">
                        Avg. Order Value
                      </p>
                      <p className="mt-1 max-w-[145px] whitespace-normal break-all text-[26px] leading-[1.05] text-[#312c27] md:text-[28px] 2xl:max-w-[170px] 2xl:text-[32px]">
                        {formatDashboardCurrency(averageOrderValue)}
                      </p>
                    </article>

                    <article className="rounded-[14px] border border-[#efe9e2] bg-[#fdfcfa] px-4 py-4">
                      <div className="flex items-center justify-between">
                        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f1d7af] text-[#8f612e]">
                          <Star className="h-4 w-4 fill-current" />
                        </span>
                        <span className="text-[10px] text-[#a99786]">Delivered success</span>
                      </div>
                      <p className="mt-3 text-[10px] uppercase tracking-[1.3px] text-[#beb2a6]">
                        Satisfaction
                      </p>
                      <p className="mt-1 text-[32px] leading-[1] text-[#312c27]">
                        {satisfactionRate.toFixed(1)}%
                      </p>
                    </article>
                  </div>

                  <section className="rounded-[16px] border border-[#eee8e1] bg-[#fcfbf9]">
                    <div className="flex items-center justify-between border-b border-[#efebe5] px-5 py-4">
                      <h2
                        className="text-[34px] leading-none text-[#2d2a26]"
                        style={{ fontFamily: "var(--font-noto-serif)" }}
                      >
                        Recent Orders
                      </h2>
                      <Link
                        href="/admin/orders"
                        className="text-[13px] text-[#8d6030] transition-colors hover:text-[#714b24]"
                      >
                        View all history
                      </Link>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-[#f1ede8] text-left text-[10px] uppercase tracking-[1.2px] text-[#b6aea7]">
                            <th className="px-5 py-3 font-medium">Product</th>
                            <th className="px-2 py-3 font-medium">Date</th>
                            <th className="px-2 py-3 font-medium">Customer</th>
                            <th className="px-2 py-3 font-medium">Amount</th>
                            <th className="px-2 py-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-5 py-8 text-center text-[13px] text-[#8f877f]"
                              >
                                No recent orders yet.
                              </td>
                            </tr>
                          ) : (
                            recentOrders.map((order) => {
                              const firstItem = order.items[0];
                              const orderDate = new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }).format(new Date(order.createdAt));

                              return (
                                <tr
                                  key={order.id}
                                  className="border-b border-[#f4f0eb] text-[13px] text-[#3d3731] last:border-none"
                                >
                                  <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                      <div className="relative h-11 w-11 overflow-hidden rounded-full bg-[#f3efe9]">
                                        <Image
                                          src={coverByOrderId[order.id] ?? FALLBACK_IMAGE}
                                          alt={firstItem?.productName ?? `Order ${order.id}`}
                                          fill
                                          sizes="44px"
                                          className="object-cover"
                                        />
                                      </div>
                                      <div className="max-w-[170px]">
                                        <p className="line-clamp-2 leading-5">
                                          {firstItem?.productName ?? `Order #${order.id}`}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-2 py-3 text-[#6f6861]">{orderDate}</td>
                                  <td className="px-2 py-3">{formatCustomerLabel(order.userId)}</td>
                                  <td className="px-2 py-3 font-medium">{formatCurrency(order.totalAmount)}</td>
                                  <td className="px-2 py-3">
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.8px] ${getOrderStatusClassName(order.status)}`}
                                    >
                                      {formatOrderStatus(order.status)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </section>

                <aside className="space-y-4">
                  <section className="rounded-[16px] border border-[#eee8e1] bg-[#fcfbf9] px-4 py-4">
                    <div className="flex items-center justify-between">
                      <h3
                        className="text-[25px] text-[#2d2a26]"
                        style={{ fontFamily: "var(--font-noto-serif)" }}
                      >
                        Weekly Revenue
                      </h3>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#9d948b] transition-colors hover:bg-[#f2eeea]"
                        aria-label="More"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-5 flex h-[178px] items-end justify-between gap-2">
                      {WEEKDAY_LABELS.map((label, index) => {
                        const value = weeklyRevenue[index];
                        const ratio = value / weekPeakRevenue;
                        const heightPercent = Math.max(12, Math.round(ratio * 100));
                        const barColor =
                          index === 1
                            ? "bg-[#8d6030]"
                            : index === 4
                              ? "bg-[#9ab48f]"
                              : "bg-[#e4dfd8]";

                        return (
                          <div key={label} className="flex flex-1 flex-col items-center">
                            <div className="flex h-[136px] w-full items-end justify-center">
                              <div
                                className={`w-[16px] rounded-full ${barColor}`}
                                style={{ height: `${heightPercent}%` }}
                                title={formatCurrency(value)}
                              />
                            </div>
                            <span className="mt-2 text-[9px] tracking-[0.8px] text-[#b3aba4]">
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="rounded-[16px] border border-[#eee8e1] bg-[#fcfbf9] px-4 py-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-[#bf4343]" />
                      <h3
                        className="text-[23px] text-[#2d2a26]"
                        style={{ fontFamily: "var(--font-noto-serif)" }}
                      >
                        Low Stock Alerts
                      </h3>
                    </div>
                    <div className="mt-3 space-y-3">
                      {lowStockProducts.length === 0 ? (
                        <p className="rounded-[10px] bg-[#f7f4ef] px-3 py-3 text-[12px] text-[#756f68]">
                          Inventory looks healthy. No low stock products right now.
                        </p>
                      ) : (
                        lowStockProducts.map((product) => {
                          const stockLeft = product.stockQuantity ?? 0;
                          const progress = Math.max(
                            4,
                            Math.round((stockLeft / LOW_STOCK_THRESHOLD) * 100)
                          );
                          return (
                            <article key={product.id} className="space-y-1.5">
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-[12px] text-[#3f3934]">{product.name}</p>
                                <p className="shrink-0 text-[11px] font-semibold text-[#bf4343]">
                                  {stockLeft} units left
                                </p>
                              </div>
                              <div className="h-[4px] rounded-full bg-[#efe9e2]">
                                <div
                                  className="h-full rounded-full bg-[#cf3b35]"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </article>
                          );
                        })
                      )}
                    </div>
                    <button
                      type="button"
                      className="mt-5 w-full rounded-full bg-[#8d6030] px-4 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#724e26]"
                    >
                      Reorder Inventory
                    </button>
                  </section>

                  <section className="relative overflow-hidden rounded-[16px] bg-[#4c413d] px-5 py-5 text-white">
                    <Image
                      src="/images/heritage-main.png"
                      alt="Seasonal collection"
                      fill
                      sizes="280px"
                      className="object-cover opacity-20"
                    />
                    <div className="relative">
                      <p
                        className="text-[30px] leading-none"
                        style={{ fontFamily: "var(--font-noto-serif)" }}
                      >
                        Seasonal Trends
                      </p>
                      <p className="mt-2 max-w-[220px] text-[12px] leading-5 text-white/80">
                        Early Winter collection is trending. Review catalog updates and campaign
                        placements.
                      </p>
                      <button
                        type="button"
                        className="mt-4 text-[12px] font-medium text-[#f0dcbf] transition-colors hover:text-[#ffe8c5]"
                      >
                        Learn More
                      </button>
                    </div>
                  </section>
                </aside>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
