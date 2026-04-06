"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ChangeEvent, type ReactNode } from "react";
import {
    ClipboardList,
    LayoutDashboard,
    Package2,
    Settings,
    Users,
    Upload,
    Trash2,
    UserPlus,
    MoreVertical,
    CheckCircle2,
    Flower2,
} from "lucide-react";
import { Navbar } from "@/src/components/layout";
import { useAuth } from "@/src/contexts";

// ─── Types ────────────────────────────────────────────────────────────────────
type TeamBadge = "Admin" | "Staff";

interface TeamMember {
    id: number;
    name: string;
    role: string;
    badge: TeamBadge;
    avatar: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────
const TEAM: TeamMember[] = [
    { id: 1, name: "Minh Quân", role: "Senior Creative Director", badge: "Admin", avatar: "/images/avatar-minh-quan.png" },
    { id: 2, name: "Elena Rossi", role: "Logistics Coordinator", badge: "Staff", avatar: "/images/avatar-elena-rossi.png" },
    { id: 3, name: "Samuel Thorne", role: "Junior Stylist", badge: "Staff", avatar: "/images/avatar-samuel-thorne.png" },
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

function BadgePill({ badge }: { badge: TeamBadge }) {
    return (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[-0.5px] ${badge === "Admin" ? "bg-[#d2e5c8] text-[#52634c]" : "bg-[#efd4c6] text-[#6e5a4f]"}`}>
            {badge}
        </span>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function AdminSettingsPageContent() {
    const { user, loading: authLoading } = useAuth();
    const [saved, setSaved] = useState(false);

    const [storeName, setStoreName] = useState("The Botanical Atelier");
    const [bio, setBio] = useState(
        "Where wild blooms meet curated elegance. Our boutique specializes in rare seasonal arrangements and botanical artistry."
    );

    const isAdmin = user?.role?.toUpperCase() === "ADMIN";

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleDiscard = () => {
        setStoreName("The Botanical Atelier");
        setBio("Where wild blooms meet curated elegance. Our boutique specializes in rare seasonal arrangements and botanical artistry.");
    };

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
            <DashboardStateCard title="Sign in to view settings"
                description="Admin settings are only available for authenticated users."
                action={<Link href="/signin" className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#8d6030] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#7a542a]">Go to Sign In</Link>}
            />
        );
    }

    if (!isAdmin) {
        return (
            <DashboardStateCard title="Admin access required"
                description="Your account does not have permission to view boutique settings."
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
                            { icon: Users, label: "Customers", href: "/admin/customers" },
                            { icon: Settings, label: "Settings", href: "/admin/settings", active: true },
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
                    {/* Page header */}
                    <div>
                        <h1 className="text-[36px] leading-[1.1] text-[#2d2a26]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                            Boutique Configuration
                        </h1>
                        <p className="mt-2 text-[15px] italic text-[#6e5a4f]">
                            Manage the essence of your botanical workspace.
                        </p>
                    </div>

                    <div className="mt-6 space-y-5">
                        {/* Row 1: General Info + Team Access */}
                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">

                            {/* General Info */}
                            <div className="rounded-[18px] border border-[#ece5de] bg-white p-7">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-[18px] text-[#2d2a26]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                                            General Information
                                        </h2>
                                        <p className="mt-1 text-[13px] text-[#a8a29e]">Core details of your digital storefront.</p>
                                    </div>
                                    <button type="button" onClick={handleSave}
                                        className="rounded-full bg-[#8d6030] px-6 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#724c25]">
                                        Update Profile
                                    </button>
                                </div>

                                {/* Logo */}
                                <div className="mt-6 flex items-center gap-6">
                                    <div className="flex h-[110px] w-[110px] items-center justify-center rounded-[10px] border border-[#d2c3c31a] bg-[#f5f3ef]">
                                        <Flower2 className="h-9 w-9 text-[#d0bb95]" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#78716c]">Atelier Signature</p>
                                        <button type="button" className="mt-2.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#7d562d] hover:opacity-80">
                                            <Upload className="h-3.5 w-3.5" /> Upload New Mark
                                        </button>
                                        <button type="button" className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#ba1a1a] hover:opacity-80">
                                            <Trash2 className="h-3.5 w-3.5" /> Remove Icon
                                        </button>
                                    </div>
                                </div>

                                {/* Fields */}
                                <div className="mt-6">
                                    <div>
                                        <label className="block text-[11px] font-bold tracking-[0.3px] text-[#4f4444]">Store Name</label>
                                        <input type="text" value={storeName}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setStoreName(e.target.value)}
                                            className="mt-2 w-full border-b border-[#d2c3c34d] bg-transparent pb-2 text-[16px] text-[#1b1c1a] outline-none focus:border-[#8d6030]"
                                            style={{ fontFamily: "var(--font-noto-serif)" }} />
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <label className="block text-[11px] font-bold tracking-[0.3px] text-[#4f4444]">Atelier Bio / Welcome Message</label>
                                    <textarea value={bio} rows={3}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                                        className="mt-2 w-full resize-none border-b border-[#d2c3c34d] bg-transparent pb-2 text-[13px] leading-[20px] text-[#1b1c1a] outline-none focus:border-[#8d6030]" />
                                </div>
                            </div>

                            {/* Team Access */}
                            <div className="rounded-[18px] border border-[#ece5de] bg-[#f5f3ef] p-6">
                                <h2 className="text-[18px] text-[#2d2a26]" style={{ fontFamily: "var(--font-noto-serif)" }}>Team Access</h2>
                                <div className="mt-5 space-y-5">
                                    {TEAM.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-12 w-12 overflow-hidden rounded-[8px] bg-[#e4e2de]">
                                                    <Image src={member.avatar} alt={member.name} fill sizes="48px" className="object-cover" />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-bold text-[#1b1c1a]">{member.name}</p>
                                                    <p className="mt-0.5 text-[11px] text-[#78716c]">{member.role}</p>
                                                    <BadgePill badge={member.badge} />
                                                </div>
                                            </div>
                                            <button type="button" className="text-[#a8a29e] hover:text-[#78716c]" aria-label="More options">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button"
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-[10px] border border-[#d2c3c3] py-2.5 text-[13px] font-semibold text-[#6e5a4f] transition-colors hover:bg-[#ede9e3]">
                                    <UserPlus className="h-4 w-4" /> Invite New Collaborator
                                </button>
                            </div>
                        </div>

                        {/* Footer actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button type="button" onClick={handleDiscard}
                                className="rounded-full px-7 py-2.5 text-[13px] font-bold text-[#78716c] transition-colors hover:bg-[#f0ece7]">
                                Discard Changes
                            </button>
                            <button type="button" onClick={handleSave}
                                className="flex items-center gap-2 rounded-full bg-[#8d6030] px-8 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#724c25]">
                                {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : "Synchronize Settings"}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
