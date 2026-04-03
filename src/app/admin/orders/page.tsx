"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ── Data ── */
const METRICS = [
    {
        label: "In Production",
        value: "14",
        sub: "Active arrangements",
        bg: "bg-white",
        valueColor: "text-[#1b1c1a]",
        labelColor: "text-[#52634c]",
        subColor: "text-[#4f4444]",
    },
    {
        label: "Transit",
        value: "08",
        sub: "En route to recipient",
        bg: "bg-white",
        valueColor: "text-[#1b1c1a]",
        labelColor: "text-[#52634c]",
        subColor: "text-[#4f4444]",
    },
    {
        label: "Weekly Growth",
        value: "+22%",
        sub: "Volume vs last week",
        bg: "bg-[#d2e5c8]",
        valueColor: "text-[#566750]",
        labelColor: "text-[#566750]",
        subColor: "text-[#566750]/80",
        border: "border border-[#52634c]/10",
    },
];

const COMMISSIONS = [
    {
        name: "The Graceful Peony",
        type: "Vase Arrangement • XL",
        recipient: "Eleanor Thorne",
        date: "May 24, 2024",
        status: "Hand-crafting",
        statusBg: "bg-[#efd4c6]",
        statusColor: "text-[#6e5b4f]",
        value: "$185.00",
    },
    {
        name: "Wild Meadow Drift",
        type: "Hand-tied Bouquet • L",
        recipient: "Julian Vane",
        date: "May 23, 2024",
        status: "Out for Delivery",
        statusBg: "bg-[#d2e5c8]",
        statusColor: "text-[#566750]",
        value: "$142.00",
    },
    {
        name: "Velvet Nocturne",
        type: "Signature Ceramic • M",
        recipient: "Isadora Moon",
        date: "May 26, 2024",
        status: "Awaiting Selection",
        statusBg: "bg-[#e4e2de]",
        statusColor: "text-[#4f4444]",
        value: "$95.00",
    },
    {
        name: "Solstice Bright",
        type: "Seasonal Wrap • S",
        recipient: "Marcus Chen",
        date: "May 23, 2024",
        status: "Out for Delivery",
        statusBg: "bg-[#d2e5c8]",
        statusColor: "text-[#566750]",
        value: "$78.00",
    },
];

const NAV_ITEMS = [
    { label: "Dashboard", href: "/admin" },
    { label: "Orders", href: "/admin/orders" },
    { label: "Products", href: "/admin/products" },
    { label: "Customers", href: "/admin/customers" },
    { label: "Marketing", href: "/admin/marketing" },
    { label: "Settings", href: "/admin/settings" },
];

/* ── Sidebar ── */
function Sidebar() {
    const pathname = usePathname();
    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-[#fbf9f5] flex flex-col z-20 pt-8">
            <nav className="flex-1 px-0 py-8 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-4 px-8 py-3 text-base font-medium transition-colors ${active
                                ? "bg-[#7d562d] text-white rounded-lg mx-2"
                                : "text-[#52634c] hover:text-[#1b1c1a]"
                                }`}
                            style={{ fontFamily: "var(--font-noto-serif)" }}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            {/* User */}
            <div className="px-8 pb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#eae8e4] shrink-0" />
                <div>
                    <p className="text-[#1b1c1a] text-sm font-medium leading-5" style={{ fontFamily: "var(--font-inter)" }}>
                        Minh Quân
                    </p>
                    <p className="text-[#78716c] text-[10px] tracking-[0.5px]" style={{ fontFamily: "var(--font-inter)" }}>
                        Head Florist
                    </p>
                </div>
            </div>
        </aside>
    );
}

/* ── Page ── */
export default function OrdersPage() {
    return (
        <div className="bg-[#fbf9f5] min-h-screen flex">
            <Sidebar />

            <main className="flex-1 pl-64">
                <div className="p-12 flex flex-col gap-8">

                    {/* Header */}
                    <div className="flex items-end justify-between">
                        <div>
                            <h1
                                className="text-[#1b1c1a] text-4xl font-normal leading-10"
                                style={{ fontFamily: "var(--font-noto-serif)" }}
                            >
                                Order Boutique
                            </h1>
                            <p className="text-[#4f4444]/80 text-lg mt-1" style={{ fontFamily: "var(--font-noto-serif)" }}>
                                The Atelier Curator
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Filter button */}
                            <button className="w-10 h-10 rounded-full bg-[#eae8e4] flex items-center justify-center hover:bg-[#d2c3c3] transition-colors">
                                <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                                    <path d="M2 4h13M5 8.5h7M7.5 13h2" stroke="#1b1c1a" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                            {/* New Commission button */}
                            <button
                                className="flex items-center gap-3 bg-[#7d562d] text-white px-8 py-3 rounded-full text-base font-medium hover:bg-[#7d562d]/90 transition-colors"
                                style={{ fontFamily: "var(--font-inter)" }}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 2v12M2 8h12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                New Commission
                            </button>
                        </div>
                    </div>

                    {/* Metric Cards */}
                    <div className="grid grid-cols-3 gap-6">
                        {METRICS.map((m) => (
                            <div
                                key={m.label}
                                className={`${m.bg} ${m.border ?? ""} rounded-xl p-8 relative overflow-hidden`}
                            >
                                <p
                                    className={`text-xs font-semibold tracking-[1.2px] uppercase ${m.labelColor} mb-8`}
                                    style={{ fontFamily: "var(--font-inter)" }}
                                >
                                    {m.label}
                                </p>
                                <p
                                    className={`text-5xl font-normal leading-[48px] ${m.valueColor} mb-2`}
                                    style={{ fontFamily: "var(--font-noto-serif)" }}
                                >
                                    {m.value}
                                </p>
                                <p className={`text-sm ${m.subColor}`} style={{ fontFamily: "var(--font-inter)" }}>
                                    {m.sub}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Commissions Table */}
                    <div className="bg-[#f5f3ef] rounded-2xl p-2">
                        <div className="bg-white rounded-xl overflow-hidden">
                            {/* Table header */}
                            <div className="flex items-center justify-between px-8 py-6 border-b border-[#d2c3c3]/15">
                                <h2
                                    className="text-[#1b1c1a] text-xl font-normal"
                                    style={{ fontFamily: "var(--font-noto-serif)" }}
                                >
                                    Recent Commissions
                                </h2>
                                <div className="flex gap-2">
                                    {["All Status", "This Week"].map((f) => (
                                        <span
                                            key={f}
                                            className="bg-[#eae8e4] text-[#4f4444] text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-[#d2c3c3] transition-colors"
                                            style={{ fontFamily: "var(--font-inter)" }}
                                        >
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Column headers */}
                            <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1fr] bg-[#f5f3ef]/50">
                                {["Arrangement", "Recipient", "Delivery Date", "Status", "Value"].map((col, i) => (
                                    <div
                                        key={col}
                                        className={`px-8 py-5 text-sm font-medium text-[#4f4444] ${i === 4 ? "text-right" : ""}`}
                                        style={{ fontFamily: "var(--font-noto-serif)" }}
                                    >
                                        {col}
                                    </div>
                                ))}
                            </div>

                            {/* Rows */}
                            {COMMISSIONS.map((c, i) => (
                                <div
                                    key={i}
                                    className={`grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1fr] items-center ${i > 0 ? "border-t border-[#d2c3c3]/15" : ""
                                        }`}
                                >
                                    {/* Arrangement */}
                                    <div className="px-8 py-6 flex items-center gap-4">
                                        <div className="w-12 h-16 rounded-t-full bg-[#e4e2de] shrink-0" />
                                        <div>
                                            <p className="text-[#1b1c1a] text-base font-medium leading-5" style={{ fontFamily: "var(--font-inter)" }}>
                                                {c.name}
                                            </p>
                                            <p className="text-[#4f4444] text-xs mt-1" style={{ fontFamily: "var(--font-inter)" }}>
                                                {c.type}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Recipient */}
                                    <div className="px-8 py-6">
                                        <p className="text-[#4f4444] text-sm font-medium" style={{ fontFamily: "var(--font-inter)" }}>
                                            {c.recipient}
                                        </p>
                                    </div>
                                    {/* Date */}
                                    <div className="px-8 py-6">
                                        <p className="text-[#1b1c1a] text-sm" style={{ fontFamily: "var(--font-inter)" }}>
                                            {c.date}
                                        </p>
                                    </div>
                                    {/* Status */}
                                    <div className="px-8 py-6">
                                        <span
                                            className={`${c.statusBg} ${c.statusColor} text-[10px] font-bold tracking-[0.5px] px-3 py-1 rounded-full`}
                                            style={{ fontFamily: "var(--font-inter)" }}
                                        >
                                            {c.status}
                                        </span>
                                    </div>
                                    {/* Value */}
                                    <div className="px-8 py-6 text-right">
                                        <p className="text-[#1b1c1a] text-base font-normal" style={{ fontFamily: "var(--font-noto-serif)" }}>
                                            {c.value}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Footer */}
                            <div className="border-t border-[#d2c3c3]/15 px-8 py-5 flex justify-center">
                                <button
                                    className="flex items-center gap-2 text-[#52634c] text-sm font-medium hover:opacity-70 transition-opacity"
                                    style={{ fontFamily: "var(--font-inter)" }}
                                >
                                    View Complete Order History
                                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                        <path d="M1 4.5h7M4.5 1l3.5 3.5L4.5 8" stroke="#52634c" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
