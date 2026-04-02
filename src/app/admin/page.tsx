"use client";

import React from "react";
import Link from "next/link";
import {
    TrendingUp, ShoppingBag, BarChart2, Star,
    AlertTriangle, ArrowUpRight, Package,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const STATS = [
    { label: "Total Revenue", value: "₫12.500.000", badge: "+12.5% vs LW", badgeColor: "bg-[#ffdcbd] text-[#52634c]", icon: TrendingUp, iconBg: "bg-[#ffdcbd]" },
    { label: "New Orders", value: "48", badge: "48 total", badgeColor: "bg-[#d2e5c8] text-[#52634c]", icon: ShoppingBag, iconBg: "bg-[#d2e5c8]" },
    { label: "Avg. Order Value", value: "₫260.000", badge: "", badgeColor: "", icon: BarChart2, iconBg: "bg-[#efd4c6]" },
    { label: "Satisfaction", value: "98.5%", badge: "9.8/10", badgeColor: "bg-[#ffd1a6] text-[#52634c]", icon: Star, iconBg: "bg-[#ffd1a6]" },
];

const ORDERS = [
    { product: "Pastel Dream", date: "Oct 24, 2023", customer: "Marc Jacobs", amount: "₫450.000", status: "Delivered", statusColor: "bg-[#d2e5c8] text-[#566750]" },
    { product: "Pure White", date: "Oct 24, 2023", customer: "Sarah Jenkins", amount: "₫820.000", status: "Shipped", statusColor: "bg-[#ffdcbd] text-[#623f18]" },
    { product: "Wild Meadow", date: "Oct 23, 2023", customer: "Thomas Kim", amount: "₫310.000", status: "Pending", statusColor: "bg-[#eae8e4] text-[#78716c]" },
];

const WEEKLY_BARS = [
    { day: "Mon", height: 40, active: false },
    { day: "Tue", height: 60, active: false },
    { day: "Wed", height: 100, active: true },
    { day: "Thu", height: 67, active: false },
    { day: "Fri", height: 80, active: false },
    { day: "Sat", height: 33, active: false },
    { day: "Sun", height: 50, active: false },
];

const LOW_STOCK = [
    { name: "White Peonies", units: "5 units left", critical: true },
    { name: "Silver Eucalyptus", units: "12 units left", critical: false },
    { name: "David Austin Roses", units: "3 units left", critical: true },
];

/* ─────────────────────────────────────────────
   Sidebar
───────────────────────────────────────────── */
const NAV_ITEMS = [
    { label: "Dashboard", href: "/admin", active: true },
    { label: "Orders", href: "/admin/orders", active: false },
    { label: "Products", href: "/admin/products", active: false },
    { label: "Customers", href: "/admin/customers", active: false },
    { label: "Analytics", href: "/admin/analytics", active: false },
    { label: "Settings", href: "/admin/settings", active: false },
];

function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#efeeea] flex flex-col z-20">
            {/* Brand */}
            <div className="px-6 py-5 border-b border-[#efeeea]">
                <span className="text-[#1b1c1a] text-[18px] font-normal" style={{ fontFamily: "var(--font-noto-serif)" }}>
                    Floral Boutique
                </span>
                <p className="text-[#a8a29e] text-[11px] mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>Admin Panel</p>
            </div>
            {/* Nav */}
            <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-[8px] text-[14px] font-medium transition-colors ${item.active
                            ? "bg-[#f5f3ef] text-[#7d562d]"
                            : "text-[#78716c] hover:bg-[#f5f3ef] hover:text-[#1b1c1a]"
                            }`}
                        style={{ fontFamily: "var(--font-inter)" }}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
            {/* Back to site */}
            <div className="px-4 pb-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2.5 text-[#a8a29e] text-[13px] hover:text-[#1b1c1a] transition-colors"
                    style={{ fontFamily: "var(--font-inter)" }}
                >
                    ← Back to site
                </Link>
            </div>
        </aside>
    );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function AdminDashboardPage() {
    return (
        <div className="bg-[#fbf9f5] min-h-screen flex">
            <Sidebar />

            {/* Main content */}
            <main className="flex-1 pl-64">
                <div className="p-12 flex flex-col gap-10">

                    {/* ── Welcome Header ── */}
                    <div className="flex flex-col gap-1">
                        <h1
                            className="text-[#1b1c1a] text-[36px] font-normal leading-[40px]"
                            style={{ fontFamily: "var(--font-noto-serif)" }}
                        >
                            Bonjour, Minh Quân
                        </h1>
                        <p className="text-[#78716c] text-[16px]" style={{ fontFamily: "var(--font-inter)" }}>
                            The Atelier is buzzing today with 12 new deliveries scheduled.
                        </p>
                    </div>

                    {/* ── Stats Grid ── */}
                    <div className="grid grid-cols-4 gap-6">
                        {STATS.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="bg-white rounded-[12px] p-8 flex flex-col justify-between gap-6">
                                    <div className="flex items-start justify-between">
                                        <div className={`${stat.iconBg} p-3 rounded-[12px]`}>
                                            <Icon className="w-5 h-5 text-[#1b1c1a]" />
                                        </div>
                                        {stat.badge && (
                                            <span className={`${stat.badgeColor} text-[12px] font-medium px-2 py-1 rounded-full`} style={{ fontFamily: "var(--font-inter)" }}>
                                                {stat.badge}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[#a8a29e] text-[12px] font-medium tracking-[1.2px] uppercase" style={{ fontFamily: "var(--font-inter)" }}>
                                            {stat.label}
                                        </p>
                                        <p className="text-[#1b1c1a] text-[30px] font-normal leading-[36px]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                                            {stat.value}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Body: Table + Sidebar Widgets ── */}
                    <div className="flex gap-8 items-start">

                        {/* Left: Recent Orders Table */}
                        <div className="flex-1 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[#1b1c1a] text-[24px] font-normal" style={{ fontFamily: "var(--font-noto-serif)" }}>
                                    Recent Orders
                                </h2>
                                <button className="text-[#7d562d] text-[14px] font-medium hover:opacity-70 transition-opacity" style={{ fontFamily: "var(--font-inter)" }}>
                                    View all history
                                </button>
                            </div>

                            <div className="bg-white rounded-[12px] overflow-hidden">
                                {/* Table header */}
                                <div className="grid grid-cols-5 bg-[#f5f3ef]">
                                    {["Product", "Date", "Customer", "Amount", "Status"].map((h) => (
                                        <div key={h} className="px-6 py-5">
                                            <span className="text-[#a8a29e] text-[12px] font-medium tracking-[0.6px] uppercase" style={{ fontFamily: "var(--font-inter)" }}>
                                                {h}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {/* Rows */}
                                {ORDERS.map((order, i) => (
                                    <div
                                        key={i}
                                        className={`grid grid-cols-5 items-center ${i > 0 ? "border-t border-[#efeeea]" : ""}`}
                                    >
                                        <div className="px-8 py-4 flex items-center gap-4">
                                            <div className="w-12 h-16 rounded-t-[44px] bg-[#eae8e4] shrink-0 overflow-hidden">
                                                <div className="w-full h-full bg-gradient-to-b from-[#d2c3c3] to-[#eae8e4]" />
                                            </div>
                                            <span className="text-[#1b1c1a] text-[14px] font-medium" style={{ fontFamily: "var(--font-inter)" }}>
                                                {order.product}
                                            </span>
                                        </div>
                                        <div className="px-6 py-4">
                                            <span className="text-[#57534e] text-[14px]" style={{ fontFamily: "var(--font-inter)" }}>
                                                {order.date}
                                            </span>
                                        </div>
                                        <div className="px-6 py-4">
                                            <span className="text-[#1b1c1a] text-[14px] font-medium" style={{ fontFamily: "var(--font-inter)" }}>
                                                {order.customer}
                                            </span>
                                        </div>
                                        <div className="px-6 py-4">
                                            <span className="text-[#1b1c1a] text-[14px] font-semibold" style={{ fontFamily: "var(--font-inter)" }}>
                                                {order.amount}
                                            </span>
                                        </div>
                                        <div className="px-6 py-4">
                                            <span className={`${order.statusColor} text-[10px] font-bold tracking-[1px] uppercase px-3 py-1 rounded-full`} style={{ fontFamily: "var(--font-inter)" }}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Widgets */}
                        <div className="w-72 shrink-0 flex flex-col gap-8">

                            {/* Weekly Revenue Chart */}
                            <div className="bg-white rounded-[12px] p-8 flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[#1b1c1a] text-[18px] font-normal" style={{ fontFamily: "var(--font-noto-serif)" }}>
                                        Weekly Revenue
                                    </h3>
                                    <Package className="w-4 h-4 text-[#a8a29e]" />
                                </div>
                                {/* Bar chart */}
                                <div className="flex items-end gap-3 h-28 px-2">
                                    {WEEKLY_BARS.map((bar) => (
                                        <div key={bar.day} className="flex flex-col items-center gap-2 flex-1">
                                            <div
                                                className={`w-full rounded-sm transition-all ${bar.active ? "bg-[#b9ccb0]" : "bg-[#efeeea]"}`}
                                                style={{ height: `${bar.height}%` }}
                                            />
                                            <span
                                                className={`text-[10px] uppercase tracking-[-0.5px] ${bar.active ? "font-bold text-[#7d562d]" : "text-[#a8a29e]"}`}
                                                style={{ fontFamily: "var(--font-inter)" }}
                                            >
                                                {bar.day}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Low Stock Alerts */}
                            <div className="bg-[#f5f3ef] rounded-[12px] p-8 flex flex-col gap-6">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-[#ba1a1a]" />
                                    <h3 className="text-[#1b1c1a] text-[18px] font-normal" style={{ fontFamily: "var(--font-noto-serif)" }}>
                                        Low Stock Alerts
                                    </h3>
                                </div>
                                <div className="flex flex-col gap-6">
                                    {LOW_STOCK.map((item) => (
                                        <div key={item.name} className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[#1b1c1a] text-[12px] font-medium" style={{ fontFamily: "var(--font-inter)" }}>
                                                    {item.name}
                                                </span>
                                                <span
                                                    className={`text-[12px] font-${item.critical ? "bold" : "normal"} ${item.critical ? "text-[#ba1a1a]" : "text-[#78716c]"}`}
                                                    style={{ fontFamily: "var(--font-inter)" }}
                                                >
                                                    {item.units}
                                                </span>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="h-1.5 bg-[#e4e2de] rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${item.critical ? "bg-[#ba1a1a]" : "bg-[#78716c]"}`}
                                                    style={{ width: item.critical ? "15%" : "35%" }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="w-full py-3 rounded-full bg-gradient-to-b from-[#7d562d] to-[#7e572d] text-white text-[14px] font-medium shadow-sm hover:opacity-90 transition-opacity"
                                    style={{ fontFamily: "var(--font-inter)" }}
                                >
                                    Reorder Inventory
                                </button>
                            </div>

                            {/* Seasonal Trends CTA */}
                            <div className="relative bg-[#4f4444] rounded-[12px] p-8 flex flex-col gap-2 overflow-hidden">
                                {/* Decorative arch */}
                                <div className="absolute right-6 top-8 w-24 h-40 rounded-t-full bg-white/20 pointer-events-none" />
                                <h3 className="relative text-white text-[20px] font-normal" style={{ fontFamily: "var(--font-noto-serif)" }}>
                                    Seasonal Trends
                                </h3>
                                <p className="relative text-[#e4e2de] text-[12px] leading-[19.5px]" style={{ fontFamily: "var(--font-inter)" }}>
                                    Early Winter collection is trending. Review catalog updates.
                                </p>
                                <button className="relative flex items-center gap-2 text-[#ffdcbd] text-[12px] font-medium mt-2 hover:opacity-70 transition-opacity" style={{ fontFamily: "var(--font-inter)" }}>
                                    Learn More
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
