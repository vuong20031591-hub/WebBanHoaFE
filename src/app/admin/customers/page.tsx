"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Package2,
  Search,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";
import { adminOrdersApi, isApiError } from "@/lib/api";
import type { OrderDTO } from "@/lib/api/types";
import { Navbar } from "@/src/components/layout";
import { useAuth } from "@/src/contexts";

type Tier = "Gold" | "Silver" | "Bronze" | "New";
type TierFilter = Tier | "All";
type SortBy = "totalSpend" | "lastOrderDate" | "fullName" | "orders";

interface Customer {
  id: number;
  fullName: string;
  email: string;
  initials: string;
  avatar: string;
  tier: Tier;
  totalSpend: number;
  totalOrders: number;
  lastOrderDate: string;
  lastOrderItem: string;
  lastOrderStatus: string;
}

interface CustomersCacheEntry {
  userId: string;
  expiresAt: number;
  customers: Customer[];
}

const PAGE_SIZE = 4;
const CUSTOMERS_CACHE_TTL_MS = 60_000;
let customersCache: CustomersCacheEntry | null = null;
const TIER_TABS: TierFilter[] = ["All", "Gold", "Silver", "Bronze", "New"];
const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "totalSpend", label: "Total Spend" },
  { value: "lastOrderDate", label: "Last Order" },
  { value: "orders", label: "Orders" },
  { value: "fullName", label: "Name" },
];
const AVATARS = [
  "/images/avatar-eleanor-vance.png",
  "/images/avatar-julian-thorne.png",
  "/images/avatar-beatrice-lowe.png",
  "/images/avatar-silas-vane.png",
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(d: string) {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function toTier(totalSpend: number, totalOrders: number): Tier {
  if (totalSpend >= 20_000_000 || totalOrders >= 30) {
    return "Gold";
  }
  if (totalSpend >= 8_000_000 || totalOrders >= 15) {
    return "Silver";
  }
  if (totalSpend >= 2_000_000 || totalOrders >= 5) {
    return "Bronze";
  }
  return "New";
}

function formatCustomerLabel(userId: string): string {
  if (!userId) {
    return "Unknown Customer";
  }
  if (userId.includes("@")) {
    const [namePart] = userId.split("@");
    return namePart
      .split(/[._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");
  }
  if (userId.length <= 14) {
    return `Customer ${userId}`;
  }
  return `Customer ${userId.slice(0, 6)}...${userId.slice(-4)}`;
}

function getInitials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((chunk) => chunk.charAt(0).toUpperCase())
    .join("");
}

function mapLoadErrorMessage(loadError: unknown): string {
  if (isApiError(loadError)) {
    if (!loadError.status) {
      return "Cannot connect to backend. Please ensure BE is running on http://localhost:8080.";
    }
    return loadError.message;
  }
  return "Unable to load customers right now.";
}

function toCustomers(orders: OrderDTO[]): Customer[] {
  const grouped = new Map<
    string,
    {
      userId: string;
      fullName: string | null;
      email: string | null;
      totalSpend: number;
      totalOrders: number;
      lastOrderDate: string;
      lastOrderItem: string;
      lastOrderStatus: string;
    }
  >();

  for (const order of orders) {
    const orderUserId = order.userId || "unknown";
    const orderEmail = order.userEmail?.trim() ? order.userEmail.trim() : null;
    const orderFullName = order.userFullName?.trim() ? order.userFullName.trim() : null;
    const key = (orderEmail ?? orderUserId).toLowerCase();
    const row = grouped.get(key);
    const firstItem = order.items[0]?.productName ?? "No product";
    const orderDate = new Date(order.createdAt).getTime();

    if (!row) {
      grouped.set(key, {
        userId: orderUserId,
        fullName: orderFullName,
        email: orderEmail,
        totalSpend: order.status === "CANCELLED" ? 0 : order.totalAmount,
        totalOrders: 1,
        lastOrderDate: order.createdAt,
        lastOrderItem: firstItem,
        lastOrderStatus: order.status,
      });
      continue;
    }

    row.totalOrders += 1;
    if (order.status !== "CANCELLED") {
      row.totalSpend += order.totalAmount;
    }
    if (!row.fullName && orderFullName) {
      row.fullName = orderFullName;
    }
    if (!row.email && orderEmail) {
      row.email = orderEmail;
    }

    const currentLastDate = new Date(row.lastOrderDate).getTime();
    if (orderDate >= currentLastDate) {
      row.lastOrderDate = order.createdAt;
      row.lastOrderItem = firstItem;
      row.lastOrderStatus = order.status;
    }
  }

  return Array.from(grouped.values()).map((value, index) => {
    const fullName = value.fullName || formatCustomerLabel(value.userId);
    const email =
      value.email || (value.userId.includes("@") ? value.userId : `${value.userId}@customer.local`);
    return {
      id: index + 1,
      fullName,
      email,
      initials: getInitials(fullName),
      avatar: AVATARS[index % AVATARS.length],
      tier: toTier(value.totalSpend, value.totalOrders),
      totalSpend: value.totalSpend,
      totalOrders: value.totalOrders,
      lastOrderDate: value.lastOrderDate,
      lastOrderItem: value.lastOrderItem,
      lastOrderStatus: value.lastOrderStatus,
    };
  });
}

function TierBadge({ tier }: { tier: Tier }) {
  const styles: Record<Tier, string> = {
    Gold: "bg-[#ffd1a44d] text-[#7d562d]",
    Silver: "bg-[#e4e2de] text-[#78716c]",
    Bronze: "bg-[#d2e5c866] text-[#566750]",
    New: "bg-[#efd4c6] text-[#6e5a4f]",
  };
  return (
    <span className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold tracking-[0.6px] ${styles[tier]}`}>
      {tier} Tier
    </span>
  );
}

function AccessStateCard({
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

export default function AdminCustomersPage() {
  const { user, loading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [tierFilter, setTierFilter] = useState<TierFilter>("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("totalSpend");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(0);

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    const currentUserId = String(user.id);
    const now = Date.now();
    const hasWarmCache = customersCache?.userId === currentUserId;
    const cacheHit =
      hasWarmCache &&
      typeof customersCache?.expiresAt === "number" &&
      customersCache.expiresAt > now;

    if (hasWarmCache && customersCache) {
      setCustomers(customersCache.customers);
      setLoading(false);
      setError(null);
    }

    if (cacheHit && reloadToken === 0) {
      return;
    }

    let active = true;

    const load = async () => {
      try {
        if (!hasWarmCache) {
          setLoading(true);
        }
        setError(null);

        const response = await adminOrdersApi.getOrders({
          includeUserProfile: true,
          page: 0,
          size: 400,
          sortBy: "createdAt",
          sortDir: "DESC",
        });

        if (!active) {
          return;
        }

        const nextCustomers = toCustomers(response.content);
        setCustomers(nextCustomers);
        customersCache = {
          userId: currentUserId,
          expiresAt: Date.now() + CUSTOMERS_CACHE_TTL_MS,
          customers: nextCustomers,
        };
      } catch (loadError) {
        if (active) {
          setError(mapLoadErrorMessage(loadError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [authLoading, isAdmin, reloadToken, user]);

  const filtered = useMemo(() => {
    let list = [...customers];
    if (tierFilter !== "All") {
      list = list.filter((c) => c.tier === tierFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.fullName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (sortBy === "totalSpend") {
        return b.totalSpend - a.totalSpend;
      }
      if (sortBy === "lastOrderDate") {
        return b.lastOrderDate.localeCompare(a.lastOrderDate);
      }
      if (sortBy === "orders") {
        return b.totalOrders - a.totalOrders;
      }
      return a.fullName.localeCompare(b.fullName);
    });
    return list;
  }, [customers, search, sortBy, tierFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const goldCount = customers.filter((c) => c.tier === "Gold").length;
  const silverCount = customers.filter((c) => c.tier === "Silver").length;

  const handleTierChange = (t: TierFilter) => {
    setTierFilter(t);
    setPage(0);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#d8d4d4] px-4 py-10 md:px-8">
        <div className="mx-auto h-[760px] max-w-[1320px] animate-pulse rounded-[24px] bg-[#fbfaf8]" />
      </div>
    );
  }

  if (!user) {
    return (
      <AccessStateCard
        title="Sign in to view customers"
        description="Customer analytics is available for authenticated administrators only."
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
      <AccessStateCard
        title="Admin access required"
        description="Your account does not have permission to open customer analytics."
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
    <div className="min-h-screen bg-[#d8d4d4]">
      <Navbar />
      <div className="grid overflow-hidden border-t border-[#e9e3dc] bg-[#fbfaf8] md:grid-cols-[218px_minmax(0,1fr)]">
        <aside className="border-b border-[#eee8e1] px-4 py-6 md:min-h-[720px] md:border-b-0 md:border-r md:border-[#eee8e1] md:px-5">
          <nav className="space-y-2">
            {[
              { icon: LayoutDashboard, label: "Dashboard", href: "/admin", active: false },
              { icon: ClipboardList, label: "Orders", href: "/admin/orders", active: false },
              { icon: Package2, label: "Products", href: "/admin/products", active: false },
              { icon: Users, label: "Customers", href: "/admin/customers", active: true },
              { icon: Settings, label: "Settings", href: "/admin/settings", active: false },
            ].map((item) => {
              const className = `flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-[13px] transition-colors ${
                item.active
                  ? "bg-[#8d6030] text-white"
                  : "text-[#4a433c] hover:bg-[#f1ede7]"
              }`;

              return (
                <Link key={item.label} href={item.href} className={className}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
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
          <div className="flex items-start justify-between">
            <div>
              <h1
                className="text-[48px] font-black leading-[1] text-[#1b1c1a]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                Customers
              </h1>
              <p className="mt-4 max-w-[560px] text-[18px] italic text-[#6e5a4f]">
                Cultivating lasting relationships through the language of flowers. Manage your premium boutique accounts and loyalty tiers.
              </p>
            </div>
            <button
              type="button"
              className="flex cursor-not-allowed items-center gap-3 rounded-full bg-[#7d562d] px-8 py-4 text-[16px] font-bold text-white opacity-70"
              disabled
            >
              <UserPlus className="h-5 w-5" />
              Add New Customer
            </button>
          </div>

          {error ? (
            <div className="mt-6 rounded-[14px] border border-[#efd0cc] bg-[#fbefec] px-4 py-3 text-[13px] text-[#8f3d35]">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => setReloadToken((current) => current + 1)}
                className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-[#8d6030] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#724c25]"
              >
                Retry
              </button>
            </div>
          ) : null}

          <div className="mt-10 flex items-center justify-between border-b border-[#f0ece7] pb-6">
            <div className="flex flex-wrap items-center gap-3">
              {TIER_TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTierChange(t)}
                  className={`rounded-full px-6 py-2 text-[14px] font-medium transition-colors ${
                    tierFilter === t
                      ? "border border-[#7d562d1a] bg-white font-semibold text-[#7d562d]"
                      : "bg-[#f5f3ef] text-[#78716c] hover:bg-[#ede9e3]"
                  }`}
                >
                  {t === "All" ? "All Clients" : `${t} Tier`}
                </button>
              ))}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setSortOpen((o) => !o)}
                className="flex items-center gap-2 text-[14px] font-medium text-[#a8a29e] hover:text-[#78716c]"
              >
                Sort by: {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-8 z-10 w-44 rounded-[12px] border border-[#e5ddd4] bg-white py-1 shadow-md">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortOpen(false);
                        setPage(0);
                      }}
                      className={`w-full px-4 py-2 text-left text-[13px] hover:bg-[#f5f3ef] ${
                        sortBy === opt.value ? "font-semibold text-[#7d562d]" : "text-[#4f4444]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-[12px] border border-[#e5ddd4] bg-white px-4 py-3">
            <Search className="h-4 w-4 text-[#a8a29e]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={handleSearch}
              className="flex-1 bg-transparent text-[14px] text-[#1b1c1a] outline-none placeholder:text-[#a8a29e]"
            />
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-[#f5f3ef]">
                    {["Client Profile", "Loyalty Status", "Total Spend", "Last Order"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-10 py-7 text-[18px] font-bold text-[#1b1c1a] ${i === 2 ? "text-right" : "text-left"}`}
                        style={{ fontFamily: "var(--font-noto-serif)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-10 py-20 text-center">
                        <Users className="mx-auto h-10 w-10 text-[#d2c3c3]" />
                        <p className="mt-4 text-[16px] font-semibold text-[#78716c]">No clients found</p>
                        <p className="mt-1 text-[14px] text-[#a8a29e]">Try adjusting your search or filter.</p>
                      </td>
                    </tr>
                  ) : (
                    rows.map((c, index) => (
                      <tr key={`${c.id}-${c.email}-${index}`} className="border-t border-[#d2c3c31a] transition-colors hover:bg-[#fdfcfa]">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-6">
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[8px] bg-[#e4e2de]">
                              <Image
                                src={c.avatar}
                                alt={c.fullName}
                                fill
                                sizes="64px"
                                className="object-cover"
                                onError={(event) => {
                                  (event.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-[#6e5a4f]">
                                {c.initials}
                              </div>
                            </div>
                            <div>
                              <p className="text-[20px] font-bold text-[#1b1c1a]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                                {c.fullName}
                              </p>
                              <p className="mt-1 text-[14px] font-medium text-[#a8a29e]">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <TierBadge tier={c.tier} />
                        </td>
                        <td className="px-10 py-8 text-right text-[18px] font-semibold text-[#1b1c1a]">
                          {formatCurrency(c.totalSpend)}
                        </td>
                        <td className="px-10 py-8">
                          <p className="text-[16px] font-medium text-[#1b1c1a]">{formatDate(c.lastOrderDate)}</p>
                          <p className="mt-1 text-[12px] italic text-[#52634c]">{c.lastOrderItem}</p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div className="flex items-center justify-between bg-[#f5f3ef] px-10 py-6">
                <p className="text-[14px] font-medium italic text-[#78716c]">
                  Showing {safePage * PAGE_SIZE + 1} to {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} clients
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={safePage === 0}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#a8a29e] hover:bg-[#f0ece7] disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPage(i)}
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-[16px] font-medium transition-colors ${
                        i === safePage ? "bg-[#7d562d] text-white" : "text-[#78716c] hover:bg-[#f0ece7]"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={safePage >= totalPages - 1}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#a8a29e] hover:bg-[#f0ece7] disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_277px]">
            <div className="relative overflow-hidden rounded-[24px] bg-[#d2e5c833] p-12">
              <div className="absolute right-0 top-0 h-80 w-80 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#7d562d1a]" />
              <h2 className="text-[30px] font-black text-[#566750]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                Loyalty Growth
              </h2>
              <p className="mt-3 max-w-[440px] text-[16px] text-[#566750b2]">
                Customer insights are now loaded from order data in your database.
              </p>
              <div className="mt-8 flex gap-12">
                {[
                  { value: goldCount, label: "Gold Clients" },
                  { value: silverCount, label: "Silver Clients" },
                  { value: customers.length, label: "Total Community" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-[36px] font-black text-[#566750]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                      {s.value}
                    </p>
                    <p className="mt-1 text-[12px] font-bold uppercase tracking-[1.2px] text-[#56675080]">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[24px] bg-[#efd4c64d] p-10">
              <h3 className="text-[24px] font-bold text-[#6e5b4f]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                Retention Rate
              </h3>
              <div className="mt-4 h-1.5 rounded-full bg-[#ffffff80]">
                <div
                  className="h-full rounded-full bg-[#6e5a4f]"
                  style={{
                    width: `${Math.min(100, Math.round((customers.filter((c) => c.totalOrders > 1).length / Math.max(1, customers.length)) * 100))}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-right text-[12px] font-bold text-[#6e5a4f]">
                {Math.min(100, Math.round((customers.filter((c) => c.totalOrders > 1).length / Math.max(1, customers.length)) * 100))}% Loyalty Retention
              </p>
              <div className="mt-6 rounded-[16px] bg-[#ffffff66] p-4">
                <p className="text-[12px] font-bold uppercase tracking-[1px] text-[#6e5b4f]">Top Insight</p>
                <p className="mt-2 text-[14px] italic text-[#6e5a4f]">
                  &ldquo;Returning customers spend significantly more than first-time buyers.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
