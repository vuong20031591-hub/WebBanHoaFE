"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, type ChangeEvent } from "react";
import {
    ClipboardList,
    Flower2,
    LayoutDashboard,
    Package2,
    Search,
    Settings,
    ShoppingCart,
    User,
    Users,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    UserPlus,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tier = "Gold" | "Silver" | "Bronze" | "New";
type TierFilter = Tier | "All";
type SortBy = "totalSpend" | "lastOrderDate" | "fullName";

interface Customer {
    id: number;
    fullName: string;
    email: string;
    initials: string;
    avatar: string;
    tier: Tier;
    totalSpend: number;
    lastOrderDate: string;
    lastOrderItem: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const CUSTOMERS: Customer[] = [
    { id: 1, fullName: "Eleanor Vance", email: "eleanor.v@estatedesign.com", initials: "EV", avatar: "/images/avatar-eleanor-vance.png", tier: "Gold", totalSpend: 12450, lastOrderDate: "2023-10-12", lastOrderItem: "Peonies & Eucalyptus Arrangement" },
    { id: 2, fullName: "Julian Thorne", email: "j.thorne@metromodern.io", initials: "JT", avatar: "/images/avatar-julian-thorne.png", tier: "Silver", totalSpend: 4120.5, lastOrderDate: "2023-11-02", lastOrderItem: "Midnight Rose Collection" },
    { id: 3, fullName: "Beatrice Lowe", email: "beatrice@loweandpartners.com", initials: "BL", avatar: "/images/avatar-beatrice-lowe.png", tier: "Gold", totalSpend: 18900, lastOrderDate: "2023-10-28", lastOrderItem: "Grand Gala Centerpieces (x12)" },
    { id: 4, fullName: "Silas Vane", email: "svane@thecollector.com", initials: "SV", avatar: "/images/avatar-silas-vane.png", tier: "Bronze", totalSpend: 850, lastOrderDate: "2023-11-04", lastOrderItem: "Dried Lavender & Wheat Bundle" },
    { id: 5, fullName: "Margot Delacroix", email: "margot.d@maisonfleur.fr", initials: "MD", avatar: "/images/avatar-eleanor-vance.png", tier: "Gold", totalSpend: 22100, lastOrderDate: "2023-11-10", lastOrderItem: "Bespoke Bridal Lookbook" },
    { id: 6, fullName: "Theo Ashford", email: "t.ashford@greenleaf.co", initials: "TA", avatar: "/images/avatar-julian-thorne.png", tier: "Silver", totalSpend: 3780, lastOrderDate: "2023-10-19", lastOrderItem: "Seasonal Subscription Box" },
    { id: 7, fullName: "Celeste Moreau", email: "celeste@ateliermoreau.com", initials: "CM", avatar: "/images/avatar-beatrice-lowe.png", tier: "Gold", totalSpend: 9650, lastOrderDate: "2023-11-08", lastOrderItem: "White Orchid Cascade" },
    { id: 8, fullName: "Rupert Finch", email: "rupert.finch@finchgroup.uk", initials: "RF", avatar: "/images/avatar-silas-vane.png", tier: "Bronze", totalSpend: 1240, lastOrderDate: "2023-09-30", lastOrderItem: "Autumn Harvest Wreath" },
    { id: 9, fullName: "Isadora Klein", email: "isa.klein@studiok.de", initials: "IK", avatar: "/images/avatar-eleanor-vance.png", tier: "Silver", totalSpend: 5500, lastOrderDate: "2023-11-01", lastOrderItem: "Tulip & Ranunculus Mix" },
    { id: 10, fullName: "Dorian Hale", email: "d.hale@halecreative.com", initials: "DH", avatar: "/images/avatar-julian-thorne.png", tier: "New", totalSpend: 320, lastOrderDate: "2023-11-05", lastOrderItem: "Welcome Bloom Box" },
    { id: 11, fullName: "Vivienne Sato", email: "v.sato@sakurastudio.jp", initials: "VS", avatar: "/images/avatar-beatrice-lowe.png", tier: "Gold", totalSpend: 15300, lastOrderDate: "2023-10-25", lastOrderItem: "Cherry Blossom Installation" },
    { id: 12, fullName: "Alistair Crane", email: "a.crane@cranearchitects.com", initials: "AC", avatar: "/images/avatar-silas-vane.png", tier: "Silver", totalSpend: 2890, lastOrderDate: "2023-10-14", lastOrderItem: "Office Lobby Arrangement" },
];

const PAGE_SIZE = 4;
const TIER_TABS: TierFilter[] = ["All", "Gold", "Silver", "Bronze", "New"];
const SORT_OPTIONS: { value: SortBy; label: string }[] = [
    { value: "totalSpend", label: "Total Spend" },
    { value: "lastOrderDate", label: "Last Order" },
    { value: "fullName", label: "Name" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCurrency(n: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string) {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}

// ─── Sub-components ───────────────────────────────────────────────────────────
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

function SidebarLink({ href, icon: Icon, label, active }: { href: string; icon: React.ElementType; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-4 px-8 py-3 text-[16px] transition-colors ${active ? "rounded-r-full bg-[#7d562d] text-white" : "text-[#52634c] hover:bg-[#f1ede7]"}`}
            style={{ fontFamily: "var(--font-noto-serif)" }}
        >
            <Icon className="h-[18px] w-[18px]" />
            {label}
        </Link>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminCustomersPage() {
    const [tierFilter, setTierFilter] = useState<TierFilter>("All");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<SortBy>("totalSpend");
    const [sortOpen, setSortOpen] = useState(false);
    const [page, setPage] = useState(0);

    const filtered = useMemo(() => {
        let list = [...CUSTOMERS];
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
    }, [tierFilter, search, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const rows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

    const goldCount = CUSTOMERS.filter((c) => c.tier === "Gold").length;
    const silverCount = CUSTOMERS.filter((c) => c.tier === "Silver").length;

    const handleTierChange = (t: TierFilter) => { setTierFilter(t); setPage(0); };
    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(0); };

    return (
        <div className="min-h-screen bg-[#fbf9f5]">
            {/* ── Navbar ── */}
            <header className="flex items-center justify-between border-b border-[#eee8e1] bg-[#fcfaf7] px-10 py-5">
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-2">
                        <Flower2 className="h-5 w-5 text-[#d0bb95]" />
                        <span className="text-[20px] text-[#2d2a26]" style={{ fontFamily: "var(--font-noto-serif)" }}>Floral Boutique</span>
                    </Link>
                    <nav className="hidden items-center gap-6 text-[14px] font-medium text-[#2d2a26] md:flex">
                        {["Shop All", "Categories", "Latest", "Our Story"].map((l) => (
                            <span key={l} className="cursor-pointer hover:text-[#8d6030]">{l}</span>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-[200px] items-center gap-2 rounded-full bg-[#f1eeea] px-4">
                        <Search className="h-3.5 w-3.5 text-[#9ca3af]" />
                        <span className="text-[12px] text-[#9ca3af]">Search arrangements...</span>
                    </div>
                    <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#f2eeea]" aria-label="Cart">
                        <ShoppingCart className="h-[18px] w-[18px] text-[#2d2a26]" />
                    </button>
                    <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#f2eeea]" aria-label="Account">
                        <User className="h-[18px] w-[18px] text-[#2d2a26]" />
                    </button>
                </div>
            </header>

            <div className="grid md:grid-cols-[256px_minmax(0,1fr)]">
                {/* ── Sidebar ── */}
                <aside className="min-h-screen border-r border-[#eee8e1] bg-[#fbf9f5] py-8">
                    <nav className="space-y-1">
                        <SidebarLink href="/admin" icon={LayoutDashboard} label="Dashboard" />
                        <SidebarLink href="/admin/orders" icon={ClipboardList} label="Orders" />
                        <SidebarLink href="/admin/products" icon={Package2} label="Products" />
                        <SidebarLink href="/admin/customers" icon={Users} label="Customers" active />
                        <SidebarLink href="/admin/settings" icon={Settings} label="Settings" />
                    </nav>
                    <div className="mt-auto flex items-center gap-3 px-8 pt-16">
                        <div className="h-10 w-10 rounded-full bg-[#eae8e4]" />
                        <div>
                            <p className="text-[14px] font-medium text-[#1b1c1a]">Minh Quân</p>
                            <p className="text-[10px] tracking-[0.5px] text-[#78716c]">Head Florist</p>
                        </div>
                    </div>
                </aside>

                {/* ── Main ── */}
                <main className="px-12 py-16">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-[48px] font-black leading-[1] text-[#1b1c1a]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                                Clientèle
                            </h1>
                            <p className="mt-4 max-w-[560px] text-[18px] italic text-[#6e5a4f]">
                                Cultivating lasting relationships through the language of flowers. Manage your premium boutique accounts and loyalty tiers.
                            </p>
                        </div>
                        <button type="button" className="flex items-center gap-3 rounded-full bg-[#7d562d] px-8 py-4 text-[16px] font-bold text-white transition-colors hover:bg-[#6a4825]">
                            <UserPlus className="h-5 w-5" />
                            Add New Customer
                        </button>
                    </div>

                    {/* Filter bar */}
                    <div className="mt-10 flex items-center justify-between border-b border-[#f0ece7] pb-6">
                        <div className="flex flex-wrap items-center gap-3">
                            {TIER_TABS.map((t) => (
                                <button key={t} type="button" onClick={() => handleTierChange(t)}
                                    className={`rounded-full px-6 py-2 text-[14px] font-medium transition-colors ${tierFilter === t ? "border border-[#7d562d1a] bg-white font-semibold text-[#7d562d]" : "bg-[#f5f3ef] text-[#78716c] hover:bg-[#ede9e3]"}`}>
                                    {t === "All" ? "All Clients" : `${t} Tier`}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <button type="button" onClick={() => setSortOpen((o) => !o)}
                                className="flex items-center gap-2 text-[14px] font-medium text-[#a8a29e] hover:text-[#78716c]">
                                Sort by: {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                                <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                            {sortOpen && (
                                <div className="absolute right-0 top-8 z-10 w-44 rounded-[12px] border border-[#e5ddd4] bg-white py-1 shadow-md">
                                    {SORT_OPTIONS.map((opt) => (
                                        <button key={opt.value} type="button"
                                            onClick={() => { setSortBy(opt.value); setSortOpen(false); setPage(0); }}
                                            className={`w-full px-4 py-2 text-left text-[13px] hover:bg-[#f5f3ef] ${sortBy === opt.value ? "font-semibold text-[#7d562d]" : "text-[#4f4444]"}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mt-4 flex items-center gap-3 rounded-[12px] border border-[#e5ddd4] bg-white px-4 py-3">
                        <Search className="h-4 w-4 text-[#a8a29e]" />
                        <input type="text" placeholder="Search by name or email..." value={search} onChange={handleSearch}
                            className="flex-1 bg-transparent text-[14px] text-[#1b1c1a] outline-none placeholder:text-[#a8a29e]" />
                    </div>

                    {/* Table */}
                    <div className="mt-6 overflow-hidden rounded-[24px] bg-white">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-[#f5f3ef]">
                                        {["Client Profile", "Loyalty Status", "Total Spend", "Last Order"].map((h, i) => (
                                            <th key={h} className={`px-10 py-7 text-[18px] font-bold text-[#1b1c1a] ${i === 2 ? "text-right" : "text-left"}`}
                                                style={{ fontFamily: "var(--font-noto-serif)" }}>{h}</th>
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
                                    ) : rows.map((c) => (
                                        <tr key={c.id} className="border-t border-[#d2c3c31a] transition-colors hover:bg-[#fdfcfa]">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[8px] bg-[#e4e2de]">
                                                        <Image src={c.avatar} alt={c.fullName} fill sizes="64px" className="object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[20px] font-bold text-[#1b1c1a]" style={{ fontFamily: "var(--font-noto-serif)" }}>{c.fullName}</p>
                                                        <p className="mt-1 text-[14px] font-medium text-[#a8a29e]">{c.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8"><TierBadge tier={c.tier} /></td>
                                            <td className="px-10 py-8 text-right text-[18px] font-semibold text-[#1b1c1a]">{formatCurrency(c.totalSpend)}</td>
                                            <td className="px-10 py-8">
                                                <p className="text-[16px] font-medium text-[#1b1c1a]">{formatDate(c.lastOrderDate)}</p>
                                                <p className="mt-1 text-[12px] italic text-[#52634c]">{c.lastOrderItem}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filtered.length > 0 && (
                            <div className="flex items-center justify-between bg-[#f5f3ef] px-10 py-6">
                                <p className="text-[14px] font-medium italic text-[#78716c]">
                                    Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} clients
                                </p>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#a8a29e] hover:bg-[#f0ece7] disabled:opacity-40">
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button key={i} type="button" onClick={() => setPage(i)}
                                            className={`flex h-10 w-10 items-center justify-center rounded-full text-[16px] font-medium transition-colors ${i === page ? "bg-[#7d562d] text-white" : "text-[#78716c] hover:bg-[#f0ece7]"}`}>
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button type="button" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#a8a29e] hover:bg-[#f0ece7] disabled:opacity-40">
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tier Insights bento */}
                    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_277px]">
                        <div className="relative overflow-hidden rounded-[24px] bg-[#d2e5c833] p-12">
                            <div className="absolute right-0 top-0 h-80 w-80 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#7d562d1a]" />
                            <h2 className="text-[30px] font-black text-[#566750]" style={{ fontFamily: "var(--font-noto-serif)" }}>Loyalty Growth</h2>
                            <p className="mt-3 max-w-[440px] text-[16px] text-[#566750b2]">
                                Gold tier members have increased by 12% this quarter. High-value clients prefer the bespoke &ldquo;Lookbook&rdquo; ordering service.
                            </p>
                            <div className="mt-8 flex gap-12">
                                {[{ value: goldCount, label: "Gold Clients" }, { value: silverCount, label: "Silver Clients" }, { value: CUSTOMERS.length, label: "Total Community" }].map((s) => (
                                    <div key={s.label}>
                                        <p className="text-[36px] font-black text-[#566750]" style={{ fontFamily: "var(--font-noto-serif)" }}>{s.value}</p>
                                        <p className="mt-1 text-[12px] font-bold uppercase tracking-[1.2px] text-[#56675080]">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-[24px] bg-[#efd4c64d] p-10">
                            <h3 className="text-[24px] font-bold text-[#6e5b4f]" style={{ fontFamily: "var(--font-noto-serif)" }}>Retention Rate</h3>
                            <div className="mt-4 h-1.5 rounded-full bg-[#ffffff80]">
                                <div className="h-full rounded-full bg-[#6e5a4f]" style={{ width: "88%" }} />
                            </div>
                            <p className="mt-2 text-right text-[12px] font-bold text-[#6e5a4f]">88% Loyalty Retention</p>
                            <div className="mt-6 rounded-[16px] bg-[#ffffff66] p-4">
                                <p className="text-[12px] font-bold uppercase tracking-[1px] text-[#6e5b4f]">Top Insight</p>
                                <p className="mt-2 text-[14px] italic text-[#6e5a4f]">
                                    &ldquo;Seasonal Subscriptions are the top retention driver.&rdquo;
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
