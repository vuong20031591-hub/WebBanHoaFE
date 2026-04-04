"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ChangeEvent } from "react";
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
    Upload,
    Trash2,
    UserPlus,
    MoreVertical,
    CheckCircle2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Badge = "Admin" | "Staff";

interface TeamMember {
    id: number;
    name: string;
    role: string;
    badge: Badge;
    initials: string;
    avatar: string;
}

interface NotifPref {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
}

// ─── Static data ──────────────────────────────────────────────────────────────
const TEAM: TeamMember[] = [
    { id: 1, name: "Minh Quân", role: "Senior Creative Director", badge: "Admin", initials: "MQ", avatar: "/images/avatar-minh-quan.png" },
    { id: 2, name: "Elena Rossi", role: "Logistics Coordinator", badge: "Staff", initials: "ER", avatar: "/images/avatar-elena-rossi.png" },
    { id: 3, name: "Samuel Thorne", role: "Junior Stylist", badge: "Staff", initials: "ST", avatar: "/images/avatar-samuel-thorne.png" },
];

const CURRENCIES = [
    "USD ($) - US Dollar",
    "VND (₫) - Vietnamese Dong",
    "EUR (€) - Euro",
    "GBP (£) - British Pound",
];

// ─── Small components ─────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={on}
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none ${on ? "bg-[#52634c]" : "bg-[#d6d3d1]"}`}
        >
            <span
                className={`mt-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0.5"}`}
            />
        </button>
    );
}

function BadgePill({ badge }: { badge: Badge }) {
    return (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[-0.5px] ${badge === "Admin" ? "bg-[#d2e5c8] text-[#52634c]" : "bg-[#efd4c6] text-[#6e5a4f]"}`}>
            {badge}
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
export default function AdminSettingsPage() {
    const [storeName, setStoreName] = useState("The Botanical Atelier");
    const [currency, setCurrency] = useState("USD ($) - US Dollar");
    const [bio, setBio] = useState(
        "Where wild blooms meet curated elegance. Our boutique specializes in rare seasonal arrangements and botanical artistry."
    );
    const [email, setEmail] = useState("admin@botanicalatelier.com");
    const [notifs, setNotifs] = useState<NotifPref[]>([
        { id: "orders", title: "Order Success Alerts", description: "Receive instant push notification for every new order.", enabled: true },
        { id: "digest", title: "Daily Boutique Digest", description: "Summary of sales and stock levels every morning at 8:00 AM.", enabled: false },
        { id: "stock", title: "Inventory Low-Stock Warning", description: "Alert when specific flower varieties drop below set thresholds.", enabled: true },
    ]);
    const [saved, setSaved] = useState(false);

    const toggleNotif = (id: string) =>
        setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)));

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleDiscard = () => {
        setStoreName("The Botanical Atelier");
        setCurrency("USD ($) - US Dollar");
        setBio("Where wild blooms meet curated elegance. Our boutique specializes in rare seasonal arrangements and botanical artistry.");
        setEmail("admin@botanicalatelier.com");
        setNotifs((prev) => prev.map((n, i) => ({ ...n, enabled: i !== 1 })));
    };

    return (
        <div className="min-h-screen bg-[#fbf9f5]">
            {/* ── Navbar ── */}
            <header className="flex items-center justify-between border-b border-[#eee8e1] bg-[#fcfaf7] px-10 py-5">
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-2">
                        <Flower2 className="h-5 w-5 text-[#d0bb95]" />
                        <span className="text-[20px] text-[#2d2a26]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                            Floral Boutique
                        </span>
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
                        <SidebarLink href="/admin/customers" icon={Users} label="Customers" />
                        <SidebarLink href="/admin/settings" icon={Settings} label="Settings" active />
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
                    {/* Page header */}
                    <div>
                        <h1 className="text-[36px] text-[#1b1c1a]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                            Boutique Configuration
                        </h1>
                        <p className="mt-3 text-[16px] italic text-[#6e5a4f]">
                            Manage the essence of your botanical workspace.
                        </p>
                    </div>

                    {/* Bento grid */}
                    <div className="mt-8 space-y-6">
                        {/* Row 1: General Info + Team Access */}
                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_277px]">

                            {/* General Info card */}
                            <div className="rounded-[16px] bg-white p-10">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-[20px] text-[#1b1c1a]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                                            General Information
                                        </h2>
                                        <p className="mt-1 text-[14px] text-[#a8a29e]">Core details of your digital storefront.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="rounded-full bg-[#7d562d] px-8 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#6a4825]"
                                    >
                                        Update Profile
                                    </button>
                                </div>

                                {/* Logo upload */}
                                <div className="mt-8 flex items-center gap-8">
                                    <div className="flex h-[128px] w-[128px] items-center justify-center rounded-[12px] border border-[#d2c3c31a] bg-[#f5f3ef]">
                                        <Flower2 className="h-10 w-10 text-[#d0bb95]" />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-bold uppercase tracking-[1.2px] text-[#78716c]">
                                            Atelier Signature
                                        </p>
                                        <button type="button" className="mt-3 flex items-center gap-2 text-[14px] font-semibold text-[#7d562d] hover:opacity-80">
                                            <Upload className="h-4 w-4" />
                                            Upload New Mark
                                        </button>
                                        <button type="button" className="mt-2 flex items-center gap-2 text-[14px] font-semibold text-[#ba1a1a] hover:opacity-80">
                                            <Trash2 className="h-4 w-4" />
                                            Remove Icon
                                        </button>
                                    </div>
                                </div>

                                {/* Fields */}
                                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-[12px] font-bold tracking-[0.3px] text-[#4f4444]">
                                            Store Name
                                        </label>
                                        <input
                                            type="text"
                                            value={storeName}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setStoreName(e.target.value)}
                                            className="mt-2 w-full border-b border-[#d2c3c34d] bg-transparent pb-2 text-[18px] text-[#1b1c1a] outline-none focus:border-[#7d562d]"
                                            style={{ fontFamily: "var(--font-noto-serif)" }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold tracking-[0.3px] text-[#4f4444]">
                                            Preferred Currency
                                        </label>
                                        <select
                                            value={currency}
                                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setCurrency(e.target.value)}
                                            className="mt-2 w-full border-b border-[#d2c3c34d] bg-transparent pb-2 text-[14px] text-[#1b1c1a] outline-none focus:border-[#7d562d]"
                                        >
                                            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="block text-[12px] font-bold tracking-[0.3px] text-[#4f4444]">
                                        Atelier Bio / Welcome Message
                                    </label>
                                    <textarea
                                        value={bio}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                                        rows={3}
                                        className="mt-2 w-full resize-none border-b border-[#d2c3c34d] bg-transparent pb-2 text-[14px] leading-[20px] text-[#1b1c1a] outline-none focus:border-[#7d562d]"
                                    />
                                </div>
                            </div>

                            {/* Team Access card */}
                            <div className="rounded-[16px] bg-[#f5f3ef] p-8">
                                <h2 className="text-[20px] text-[#1b1c1a]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                                    Team Access
                                </h2>
                                <div className="mt-6 space-y-6">
                                    {TEAM.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-14 w-14 overflow-hidden rounded-[8px] bg-[#e4e2de]">
                                                    <Image src={member.avatar} alt={member.name} fill sizes="56px" className="object-cover" />
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-[#1b1c1a]">{member.name}</p>
                                                    <p className="mt-0.5 text-[12px] text-[#78716c]">{member.role}</p>
                                                    <BadgePill badge={member.badge} />
                                                </div>
                                            </div>
                                            <button type="button" className="text-[#a8a29e] hover:text-[#78716c]" aria-label="More options">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#d2c3c3] py-3 text-[14px] font-semibold text-[#6e5a4f] transition-colors hover:bg-[#ede9e3]"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Invite New Collaborator
                                </button>
                            </div>
                        </div>

                        {/* Row 2: Notification Preferences */}
                        <div className="relative overflow-hidden rounded-[16px] bg-[#f5f3ef] p-8">
                            {/* Decorative circle */}
                            <div className="pointer-events-none absolute right-[-20px] top-[-20px] h-40 w-40 rounded-full bg-[#7d562d0d]" />

                            <h2 className="text-[20px] text-[#1b1c1a]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                                Notification Preferences
                            </h2>

                            <div className="mt-6 space-y-3">
                                {notifs.map((n) => (
                                    <div
                                        key={n.id}
                                        className="flex items-center justify-between rounded-[12px] bg-white/40 px-4 py-4"
                                    >
                                        <div>
                                            <p className="text-[14px] font-bold text-[#1b1c1a]">{n.title}</p>
                                            <p className="mt-0.5 text-[12px] text-[#78716c]">{n.description}</p>
                                        </div>
                                        <Toggle on={n.enabled} onToggle={() => toggleNotif(n.id)} />
                                    </div>
                                ))}
                            </div>

                            {/* Email channel */}
                            <div className="mt-6 border-t border-[#d2c3c31a] pt-6">
                                <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#a8a29e]">
                                    Email Channel Configuration
                                </p>
                                <div className="mt-3 flex items-center gap-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                        className="flex-1 rounded-[8px] bg-white/60 px-4 py-2.5 text-[14px] text-[#6b7280] outline-none focus:ring-1 focus:ring-[#7d562d]"
                                    />
                                    <button
                                        type="button"
                                        className="rounded-[8px] bg-[#e4e2de] px-6 py-2.5 text-[12px] font-bold text-[#6e5a4f] transition-colors hover:bg-[#d8d4ce]"
                                    >
                                        Verify Email
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer actions */}
                        <div className="flex items-center justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={handleDiscard}
                                className="rounded-full px-8 py-3 text-[14px] font-bold text-[#78716c] transition-colors hover:bg-[#f0ece7]"
                            >
                                Discard Changes
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="flex items-center gap-2 rounded-full bg-[#7d562d] px-10 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#6a4825]"
                            >
                                {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : "Synchronize Settings"}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
