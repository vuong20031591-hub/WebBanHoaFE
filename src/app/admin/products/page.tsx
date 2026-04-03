"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ── Data ── */
const METRICS = [
    { label: "Total SKU Count", value: "142", sub: "+12 this month", subColor: "text-[#52634c]", labelColor: "text-[#52634c]" },
    { label: "Low Stock Alert", value: "08", sub: "Requires attention", subColor: "text-[#ba1a1a]", labelColor: "text-[#ba1a1a]" },
    { label: "Active\nCollections", value: "12", sub: "Spring '24 Essentials", subColor: "text-[#4f4444]", labelColor: "text-[#52634c]" },
    { label: "Out of Stock", value: "03", sub: "Waitlisted items", subColor: "text-[#4f4444]", labelColor: "text-[#4f4444]" },
];

const FILTER_TABS = ["All Elements", "Cut Flowers", "Arrangements", "Dried Botany"];

const PRODUCTS = [
    { name: "Midnight Dahlia", price: "$12.50 / stem", sku: "SKU: DA-MD-001", stock: 48, stockLabel: "48 in stock", stockColor: "text-[#52634c]", dotColor: "bg-[#52634c]", img: "/images/inventory/midnight-dahlia.jpg" },
    { name: "Spring Meadow", price: "$85.00", sku: "SKU: AR-SM-042", stock: 8, stockLabel: "08 in stock", stockColor: "text-[#ba1a1a]", dotColor: "bg-[#ba1a1a]", img: "/images/inventory/spring-meadow.jpg" },
    { name: "Eucalyptus Bundle", price: "$18.00", sku: "SKU: FO-EU-012", stock: 112, stockLabel: "112 in stock", stockColor: "text-[#52634c]", dotColor: "bg-[#52634c]", img: "/images/inventory/eucalyptus-bundle.jpg" },
    { name: "Porcelain Peony", price: "$14.00", sku: "SKU: PE-PP-005", stock: 24, stockLabel: "24 in stock", stockColor: "text-[#52634c]", dotColor: "bg-[#52634c]", img: "/images/inventory/porcelain-peony.jpg" },
    { name: "Golden Ranunculus", price: "$9.50", sku: "SKU: RA-GR-009", stock: 62, stockLabel: "62 in stock", stockColor: "text-[#52634c]", dotColor: "bg-[#52634c]", img: "/images/inventory/golden-ranunculus.jpg" },
    { name: "Velvet Rose", price: "$11.00", sku: "SKU: RO-VR-011", stock: 0, stockLabel: "Out of stock", stockColor: "text-[#4f4444]", dotColor: "bg-[#a8a29e]", img: "/images/inventory/velvet-rose.jpg" },
];

const STOCK_LOG = [
    { name: "Midnight Dahlia", sku: "DA-MD-001", adjustment: "+20 units", adjustColor: "text-[#52634c]", source: "Vendor Receipt", date: "24 Mar 2024" },
    { name: "Spring Meadow", sku: "AR-SM-042", adjustment: "-05 units", adjustColor: "text-[#ba1a1a]", source: "Order #1902", date: "23 Mar 2024" },
    { name: "Eucalyptus Bundle", sku: "FO-EU-012", adjustment: "+40 units", adjustColor: "text-[#52634c]", source: "Internal Transfer", date: "22 Mar 2024" },
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
                            className={`flex items-center gap-4 px-8 py-3 text-base font-medium transition-colors ${active ? "bg-[#7d562d] text-white rounded-lg mx-2" : "text-[#52634c] hover:text-[#1b1c1a]"
                                }`}
                            style={{ fontFamily: "var(--font-noto-serif)" }}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="px-8 pb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#eae8e4] shrink-0" />
                <div>
                    <p className="text-[#1b1c1a] text-sm font-medium leading-5" style={{ fontFamily: "var(--font-inter)" }}>Minh Quân</p>
                    <p className="text-[#78716c] text-[10px] tracking-[0.5px]" style={{ fontFamily: "var(--font-inter)" }}>Head Florist</p>
                </div>
            </div>
        </aside>
    );
}

/* ── Page ── */
export default function ProductsPage() {
    return (
        <div className="bg-[#fbf9f5] min-h-screen flex">
            <Sidebar />
            <main className="flex-1 pl-64">
                <div className="p-12 flex flex-col gap-8">

                    {/* Header */}
                    <div>
                        <h1 className="text-[#1b1c1a] text-4xl font-normal leading-10" style={{ fontFamily: "var(--font-noto-serif)" }}>
                            The Atelier Inventory
                        </h1>
                        <p className="text-[#4f4444] text-lg mt-3 tracking-[-0.45px]" style={{ fontFamily: "var(--font-inter)" }}>
                            Curation of botanical elements and master arrangements.
                        </p>
                    </div>

                    {/* Metric Cards */}
                    <div className="grid grid-cols-4 gap-6">
                        {METRICS.map((m) => (
                            <div key={m.label} className="bg-white rounded-xl p-8 flex flex-col gap-4">
                                <p className={`text-xs tracking-[1.2px] uppercase ${m.labelColor} whitespace-pre-line`} style={{ fontFamily: "var(--font-inter)" }}>
                                    {m.label}
                                </p>
                                <p className="text-[#1b1c1a] text-4xl font-normal leading-10" style={{ fontFamily: "var(--font-noto-serif)" }}>
                                    {m.value}
                                </p>
                                <p className={`text-xs ${m.subColor}`} style={{ fontFamily: "var(--font-inter)" }}>
                                    {m.sub}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Filter Tabs + Add Button */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            {FILTER_TABS.map((tab, i) => (
                                <button
                                    key={tab}
                                    className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${i === 0 ? "bg-[#eae8e4] text-[#1b1c1a]" : "text-[#4f4444] hover:bg-[#eae8e4]"
                                        }`}
                                    style={{ fontFamily: "var(--font-inter)" }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <button
                            className="flex items-center gap-3 bg-[#7d562d] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#7d562d]/90 transition-colors"
                            style={{ fontFamily: "var(--font-inter)" }}
                        >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M5 1v8M1 5h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            New Botanical Element
                        </button>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-4 gap-6">
                        {PRODUCTS.map((p) => (
                            <div key={p.sku} className="flex flex-col">
                                {/* Image */}
                                <div className="relative h-[277px] rounded-t-2xl overflow-hidden bg-[#f5f3ef]">
                                    <Image src={p.img} alt={p.name} fill className="object-cover" />
                                </div>
                                {/* Info */}
                                <div className="px-2 pt-4 pb-2">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-[#1b1c1a] text-xl font-normal leading-7" style={{ fontFamily: "var(--font-noto-serif)" }}>
                                            {p.name}
                                        </h3>
                                        <span className="text-[#4f4444] text-sm shrink-0 ml-2 mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
                                            {p.price}
                                        </span>
                                    </div>
                                    <p className="text-[#4f4444] text-xs tracking-[1.2px] mb-3" style={{ fontFamily: "var(--font-inter)" }}>
                                        {p.sku}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-[#d2c3c3]/15">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${p.dotColor}`} />
                                            <span className={`text-sm font-medium ${p.stockColor}`} style={{ fontFamily: "var(--font-inter)" }}>
                                                {p.stockLabel}
                                            </span>
                                        </div>
                                        <svg width="9" height="2" viewBox="0 0 9 2" fill="none">
                                            <path d="M0 1h9" stroke="#4f4444" strokeWidth="1.75" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stock Adjustment Log */}
                    <div>
                        <h2 className="text-[#1b1c1a] text-2xl font-normal mb-6" style={{ fontFamily: "var(--font-noto-serif)" }}>
                            Stock Adjustment Log
                        </h2>
                        <div className="bg-white rounded-xl overflow-hidden">
                            {/* Header row */}
                            <div className="grid grid-cols-5 bg-[#f5f3ef] px-6 py-4">
                                {["Botanical Element", "SKU", "Adjustment", "Source", "Date"].map((col, i) => (
                                    <p
                                        key={col}
                                        className={`text-xs tracking-[1.2px] uppercase text-[#4f4444] ${i === 4 ? "text-right" : ""}`}
                                        style={{ fontFamily: "var(--font-inter)" }}
                                    >
                                        {col}
                                    </p>
                                ))}
                            </div>
                            {/* Rows */}
                            {STOCK_LOG.map((row, i) => (
                                <div
                                    key={i}
                                    className={`grid grid-cols-5 items-center px-6 py-5 ${i > 0 ? "border-t border-[#d2c3c3]/15" : ""} ${i % 2 === 1 ? "bg-[#f5f3ef]/30" : ""}`}
                                >
                                    <p className="text-[#1b1c1a] text-sm font-medium" style={{ fontFamily: "var(--font-inter)" }}>{row.name}</p>
                                    <p className="text-[#4f4444] text-xs font-mono">{row.sku}</p>
                                    <p className={`text-sm font-medium ${row.adjustColor}`} style={{ fontFamily: "var(--font-inter)" }}>{row.adjustment}</p>
                                    <p className="text-[#4f4444] text-sm" style={{ fontFamily: "var(--font-inter)" }}>{row.source}</p>
                                    <p className="text-[#78716c] text-sm text-right" style={{ fontFamily: "var(--font-inter)" }}>{row.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
