"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
    ClipboardList,
    LayoutDashboard,
    Package2,
    Search,
    Settings,
    Users,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    UserPlus,
    RefreshCw,
} from "lucide-react";
import { Navbar } from "@/src/components/layout";
import { useAuth } from "@/src/contexts";
import { formatCurrency } from "@/lib/currency";
import { isApiError } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
// TODO: move to @/lib/api/types when backend is ready
export type CustomerTier = "Gold" | "Silver" | "Bronze" | "New";
export type CustomerTierFilter = CustomerTier | "All";
export type CustomerSortBy = "totalSpend" | "lastOrderDate" | "fullName";

export interface CustomerDTO {
    id: number;
    fullName: string;
    email: string;
    avatar: string | null;
    tier: CustomerTier;
    totalSpend: number;
    lastOrderDate: string;
    lastOrderItem: string;
    totalOrders: number;
}

// ─── Mock data (replace with real API call when backend ready) ────────────────
const MOCK_CUSTOMERS: CustomerDTO[] = [
    { id: 1, fullName: "Eleanor Vance", email: "eleanor.v@estatedesign.com", avatar: "/images/avatar-eleanor-vance.png", tier: "Gold", totalSpend: 12450000, lastOrderDate: "2023-10-12", lastOrderItem: "Peonies & Eucalyptus Arrangement", totalOrders: 18 },
    { id: 2, fullName: "Julian Thorne", email: "j.thorne@metromodern.io", avatar: "/images/avatar-julian-thorne.png", tier: "Silver", totalSpend: 4120500, lastOrderDate: "2023-11-02", lastOrderItem: "Midnight Rose Collection", totalOrders: 9 },
    { id: 3, fullName: "Beatrice Lowe", email: "beatrice@loweandpartners.com", avatar: "/images/avatar-beatrice-lowe.png", tier: "Gold", totalSpend: 18900000, lastOrderDate: "2023-10-28", lastOrderItem: "Grand Gala Centerpieces (x12)", totalOrders: 24 },
    { id: 4, fullName: "Silas Vane", email: "svane@thecollector.com", avatar: "/images/avatar-silas-vane.png", tier: "Bronze", totalSpend: 850000, lastOrderDate: "2023-11-04", lastOrderItem: "Dried Lavender & Wheat Bundle", totalOrders: 3 },
    { id: 5, fullName: "Margot Delacroix", email: "margot.d@maisonfleur.fr", avatar: "/images/avatar-eleanor-vance.png", tier: "Gold", totalSpend: 22100000, lastOrderDate: "2023-11-10", lastOrderItem: "Bespoke Bridal Lookbook", totalOrders: 31 },
    { id: 6, fullName: "Theo Ashford", email: "t.ashford@greenleaf.co", avatar: "/images/avatar-julian-thorne.png", tier: "Silver", totalSpend: 3780000, lastOrderDate: "2023-10-19", lastOrderItem: "Seasonal Subscription Box", totalOrders: 7 },
    { id: 7, fullName: "Celeste Moreau", email: "celeste@ateliermoreau.com", avatar: "/images/avatar-beatrice-lowe.png", tier: "Gold", totalSpend: 9650000, lastOrderDate: "2023-11-08", lastOrderItem: "White Orchid Cascade", totalOrders: 14 },
    { id: 8, fullName: "Rupert Finch", email: "rupert.finch@finchgroup.uk", avatar: "/images/avatar-silas-vane.png", tier: "Bronze", totalSpend: 1240000, lastOrderDate: "2023-09-30", lastOrderItem: "Autumn Harvest Wreath", totalOrders: 4 },
    { id: 9, fullName: "Isadora Klein", email: "isa.klein@studiok.de", avatar: "/images/avatar-eleanor-vance.png", tier: "Silver", totalSpend: 5500000, lastOrderDate: "2023-11-01", lastOrderItem: "Tulip & Ranunculus Mix", totalOrders: 11 },
    { id: 10, fullName: "Dorian Hale", email: "d.hale@halecreative.com", avatar: "/images/avatar-julian-thorne.png", tier: "New", totalSpend: 320000, lastOrderDate: "2023-11-05", lastOrderItem: "Welcome Bloom Box", totalOrders: 1 },
    { id: 11, fullName: "Vivienne Sato", email: "v.sato@sakurastudio.jp", avatar: "/images/avatar-beatrice-lowe.png", tier: "Gold", totalSpend: 15300000, lastOrderDate: "2023-10-25", lastOrderItem: "Cherry Blossom Installation", totalOrders: 20 },
    { id: 12, fullName: "Alistair Crane", email: "a.crane@cranearchitects.com", avatar: "/images/avatar-silas-vane.png", tier: "Silver", totalSpend: 2890000, lastOrderDate: "2023-10-14", lastOrderItem: "Office Lobby Arrangement", totalOrders: 6 },
];

// TODO: replace with real API call
async function fetchCustomers(): Promise<CustomerDTO[]> {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return MOCK_CUSTOMERS;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 4;
const TIER_TABS: CustomerTierFilter[] = ["All", "Gold", "Silver", "Bronze", "New"];
const SORT_OPTIONS: { value: CustomerSortBy; label: string }[] = [
    { value: "totalSpend", label: "Total Spend" },
    { value: "lastOrderDate", label: "Last Order" },
    { value: "fullName", label: "Name" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function DashboardStateCard({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
    return (
        <div className="min-h-screen bg-[#d8d4d4] px-4 py-10 md:px-8">
            <div className="mx-auto max-w-[980px] rounded-[24px] border border-[#ebe5de] bg-[#fbfaf8] px-8 py-16 text-center">
                <h1 className="text-[38px] leading-[1.1] text-[#2d2a26]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                    {title}
                </h1>
                <p className="mx-auto mt-4 max-w-[560px] text-[15px] leading-7 text-[#5c6b5e]">{description}</p>
                {action ? <div className="mt-9">{action}</div> : null}
            </div>
        </div>
    );
}

function TierBadge({ tier }: { tier: CustomerTier }) {
    const styles: Record<CustomerTier, string> = {
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

function SkeletonRow() {
    return (
        <tr className="border-t border-[#f5efe8]">
            {[40, 20, 16, 24].map((w) => (
                <td key={w} className="px-10 py-8">
                    <div className="h-4 animate-pulse rounded-full bg-[#f0ece7]" style={{ width: `${w * 3}px` }} />
                </td>
            ))}
        </tr>
    );
}

function formatDate(d: string) {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}

// ─── Main component ───────────────────────────────────────────────────────────
export function AdminCustomersPageContent() {
    const { user, loading: authLoading } = useAuth();

    const [customers, setCustomers] = useState<CustomerDTO[]>([]);
    const [contentLoading, setContentLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    const [tierFilter, setTierFilter] = useState<CustomerTierFilter>("All");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<CustomerSortBy>("totalSpend");
    const [sortOpen, setSortOpen] = useState(false);
    const [page, setPage] = useState(0);

    const isAdmin = user?.role?.toUpperCase() === "ADMIN";

    useEffect(() => {
        if (authLoading || !isAdmin) {
            if (!authLoading) setContentLoading(false);
            return;
        }

        let active = true;
        setContentLoading(true);
        setError(null);

        fetchCustomers()
            .then((data) => { if (active) setCustomers(data); })
            .catch((err) => {
                if (!active) return;
                setError(isApiError(err) ? err.message : "Failed to load customer data.");
            })
            .finally(() => { if (active) setContentLoading(false); });

        return () => { active = false; };
    }, [authLoading, isAdmin, reloadToken]);

    // Reset page on filter change
    useEffect(() => { setPage(0); }, [tierFilter, search, sortBy]);

    const filtered = useMemo(() => {
        let list = [...customers];
        if (tierFilter !== "All") list = list.filter((c) => c.tier === tierFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((c) => c.fullName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
        }
        list.sort((a, b) => {
            if (sortBy === "totalSpend") return b.totalSpend - a.totalSpend;
            if (sortBy === "lastOrderDate") return b.lastOrderDate.localeCompare(a.lastOrderDate);
            return a.fullName.localeCompare(b.fullName);
        });
        return list;
    }, [customers, tierFilter, search, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const rows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

    const goldCount = useMemo(() => customers.filter((c) => c.tier === "Gold").length, [customers]);
    const silverCount = useMemo(() => customers.filter((c) => c.tier === "Silver").length, [customers]);

    // ── Auth guards ──
    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#d8d4d4] px-4 py-10 md:px-8">
                <div className="mx-auto h-[640px] max-w-[1320px] animate-pulse rounded-[24px] bg-[#fbfaf8]" />
            </div>
        );
    }

    if (!user) {
        return (
            <DashboardStateCard title="Sign in to view customers"
                description="Customer management is only available for authenticated administrators."
                action={<Link href="/signin" className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#8d6030] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#7a542a]">Go to Sign In</Link>}
            />
        );
    }

    if (!isAdmin) {
        return (
            <DashboardStateCard title="Admin access required"
                description="Your account does not have permission to view customer management."
                action={<Link href="/" className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] border border-[#d6cbc0] px-8 text-[14px] font-medium text-[#6d5742] transition-colors hover:bg-[#f5efe8]">Back to Store</Link>}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#fbf9f5]">
            <Navbar />
            <div className="grid overflow-hidden border-t border-[#e9e3dc] bg-[#fbfaf8] md:grid-cols-[218px_minmax(0,1fr)]">
                {/* Sidebar */}
                <aside className="border-b border-[#eee8e1] px-4 py-6 md:min-h-[720px] md:border-b-0 md:border-r md:border-[#eee8e1] md:px-5">
                    <nav className="space-y-1.5">
                        {[
                            { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
                            { icon: ClipboardList, label: "Orders", href: "/admin/orders" },
                            { icon: Package2, label: "Products", href: "/admin/products" },
                            { icon: Users, label: "Customers", href: "/admin/customers", active: true },
                            { icon: Settings, label: "Settings", href: "/admin/settings" },
                        ].map((item) => {
                            const cls = `flex w-full items-center gap-3 rounded-r-full rounded-l-[6px] px-4 py-3 text-left text-[13px] transition-colors ${item.active ? "bg-[#9b6a31] text-white" : "text-[#4a433c] hover:bg-[#f1ede7]"}`;
                            return (
                                <Link key={item.label} href={item.href} className={cls}>
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

                {/* Main */}
                <main className="px-4 py-7 md:px-7">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h1 className="text-[46px] leading-[1.04] text-[#2d2a26]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                                Clientèle
                            </h1>
                            <p className="mt-2 max-w-[480px] text-[16px] italic text-[#6e5a4f]">
                                Cultivating lasting relationships through the language of flowers.
                            </p>
                        </div>
                        <button type="button" className="inline-flex h-10 items-center gap-2 rounded-full bg-[#8d6030] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#724c25]">
                            <UserPlus className="h-4 w-4" />
                            Add New Customer
                        </button>
                    </div>

                    {/* Filter + sort bar */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ece7] pb-5">
                        <div className="flex flex-wrap items-center gap-2">
                            {TIER_TABS.map((t) => (
                                <button key={t} type="button"
                                    onClick={() => setTierFilter(t)}
                                    className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${tierFilter === t ? "border border-[#7d562d1a] bg-white font-semibold text-[#7d562d]" : "bg-[#f5f3ef] text-[#78716c] hover:bg-[#ede9e3]"}`}>
                                    {t === "All" ? "All Clients" : `${t} Tier`}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <button type="button" onClick={() => setSortOpen((o) => !o)}
                                className="flex items-center gap-1.5 text-[13px] font-medium text-[#a8a29e] hover:text-[#78716c]">
                                Sort by: {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                                <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                            {sortOpen ? (
                                <div className="absolute right-0 top-7 z-10 w-44 rounded-[12px] border border-[#e5ddd4] bg-white py-1 shadow-md">
                                    {SORT_OPTIONS.map((opt) => (
                                        <button key={opt.value} type="button"
                                            onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                                            className={`w-full px-4 py-2 text-left text-[13px] hover:bg-[#f5f3ef] ${sortBy === opt.value ? "font-semibold text-[#7d562d]" : "text-[#4f4444]"}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mt-3 flex items-center gap-3 rounded-[12px] border border-[#e5ddd4] bg-white px-4 py-2.5">
                        <Search className="h-4 w-4 shrink-0 text-[#a8a29e]" />
                        <input type="text" placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent text-[13px] text-[#1b1c1a] outline-none placeholder:text-[#a8a29e]" />
                    </div>

                    {/* Table */}
                    <div className="mt-5 overflow-hidden rounded-[18px] border border-[#ece5de] bg-white">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-[#f5f3ef] text-left text-[13px] text-[#2d2a26]">
                                        <th className="px-6 py-5 font-semibold" style={{ fontFamily: "var(--font-noto-serif)" }}>Client Profile</th>
                                        <th className="px-4 py-5 font-semibold" style={{ fontFamily: "var(--font-noto-serif)" }}>Loyalty Status</th>
                                        <th className="px-4 py-5 text-right font-semibold" style={{ fontFamily: "var(--font-noto-serif)" }}>Total Spend</th>
                                        <th className="px-6 py-5 font-semibold" style={{ fontFamily: "var(--font-noto-serif)" }}>Last Order</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Loading */}
                                    {contentLoading ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />) : null}

                                    {/* Error */}
                                    {!contentLoading && error ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-14 text-center">
                                                <p className="text-[15px] font-semibold text-[#8f3d35]">Could not load customer data</p>
                                                <p className="mt-1 text-[13px] text-[#a8a29e]">{error}</p>
                                                <button type="button" onClick={() => setReloadToken((t) => t + 1)}
                                                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#8d6030] px-5 py-2 text-[12px] font-medium text-white hover:bg-[#724c25]">
                                                    <RefreshCw className="h-3.5 w-3.5" /> Retry
                                                </button>
                                            </td>
                                        </tr>
                                    ) : null}

                                    {/* Empty */}
                                    {!contentLoading && !error && rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-16 text-center">
                                                <Users className="mx-auto h-9 w-9 text-[#d2c3c3]" />
                                                <p className="mt-3 text-[14px] font-semibold text-[#78716c]">No clients found</p>
                                                <p className="mt-1 text-[13px] text-[#a8a29e]">Try adjusting your search or filter.</p>
                                            </td>
                                        </tr>
                                    ) : null}

                                    {/* Success */}
                                    {!contentLoading && !error ? rows.map((c) => (
                                        <tr key={c.id} className="border-t border-[#f5efe8] text-[13px] text-[#3d3731] transition-colors hover:bg-[#fdfcfa]">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[8px] bg-[#e4e2de]">
                                                        {c.avatar ? (
                                                            <Image src={c.avatar} alt={c.fullName} fill sizes="56px" className="object-cover" />
                                                        ) : (
                                                            <span className="flex h-full w-full items-center justify-center text-[13px] font-bold text-[#78716c]">
                                                                {c.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-[15px] font-semibold text-[#2d2a26]">{c.fullName}</p>
                                                        <p className="mt-0.5 text-[12px] text-[#a8a29e]">{c.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5"><TierBadge tier={c.tier} /></td>
                                            <td className="px-4 py-5 text-right font-medium text-[#2d2a26]">{formatCurrency(c.totalSpend)}</td>
                                            <td className="px-6 py-5">
                                                <p className="font-medium text-[#2d2a26]">{formatDate(c.lastOrderDate)}</p>
                                                <p className="mt-0.5 text-[12px] italic text-[#52634c]">{c.lastOrderItem}</p>
                                            </td>
                                        </tr>
                                    )) : null}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {!contentLoading && !error && filtered.length > 0 ? (
                            <div className="flex items-center justify-between border-t border-[#f5efe8] bg-[#f5f3ef] px-6 py-4">
                                <p className="text-[12px] italic text-[#78716c]">
                                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} clients
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#a8a29e] hover:bg-[#f0ece7] disabled:opacity-40">
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button key={i} type="button" onClick={() => setPage(i)}
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium transition-colors ${i === page ? "bg-[#8d6030] text-white" : "text-[#78716c] hover:bg-[#f0ece7]"}`}>
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button type="button" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#a8a29e] hover:bg-[#f0ece7] disabled:opacity-40">
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Tier Insights bento */}
                    {!contentLoading && !error && customers.length > 0 ? (
                        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                            <div className="relative overflow-hidden rounded-[18px] bg-[#d2e5c833] p-8">
                                <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#7d562d1a]" />
                                <h2 className="text-[24px] font-black text-[#566750]" style={{ fontFamily: "var(--font-noto-serif)" }}>Loyalty Growth</h2>
                                <p className="mt-2 max-w-[400px] text-[13px] text-[#566750b2]">
                                    Gold tier members have increased by 12% this quarter. High-value clients prefer the bespoke &ldquo;Lookbook&rdquo; ordering service.
                                </p>
                                <div className="mt-6 flex gap-8">
                                    {[{ value: goldCount, label: "Gold Clients" }, { value: silverCount, label: "Silver Clients" }, { value: customers.length, label: "Total Community" }].map((s) => (
                                        <div key={s.label}>
                                            <p className="text-[30px] font-black text-[#566750]" style={{ fontFamily: "var(--font-noto-serif)" }}>{s.value}</p>
                                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[1.2px] text-[#56675080]">{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-[18px] bg-[#efd4c64d] p-6">
                                <h3 className="text-[18px] font-bold text-[#6e5b4f]" style={{ fontFamily: "var(--font-noto-serif)" }}>Retention Rate</h3>
                                <div className="mt-3 h-1.5 rounded-full bg-[#ffffff80]">
                                    <div className="h-full rounded-full bg-[#6e5a4f]" style={{ width: "88%" }} />
                                </div>
                                <p className="mt-1.5 text-right text-[11px] font-bold text-[#6e5a4f]">88% Loyalty Retention</p>
                                <div className="mt-4 rounded-[12px] bg-[#ffffff66] p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#6e5b4f]">Top Insight</p>
                                    <p className="mt-1.5 text-[13px] italic text-[#6e5a4f]">
                                        &ldquo;Seasonal Subscriptions are the top retention driver.&rdquo;
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </main>
            </div>
        </div>
    );
}
