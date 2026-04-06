"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronDown, Truck, Flower2, RotateCcw, MessageCircle, Phone } from "lucide-react";
import { Navbar } from "@/components/layout";

/* ─────────────────────────────────────────────
   FAQ Data
───────────────────────────────────────────── */
const FAQ_SECTIONS = [
    {
        id: "shipping",
        icon: Truck,
        title: "Shipping & Delivery",
        items: [
            {
                q: "Do you offer same-day delivery?",
                a: "Yes, we offer same-day delivery for orders placed before 11:00 AM in select areas. Our artisans hand-deliver each arrangement to ensure it arrives in perfect condition. Please check availability at checkout by entering your postcode.",
            },
            {
                q: "How are the flowers protected during transit?",
                a: "Every arrangement is carefully packaged in our signature water-sealed boxes with temperature-controlled insulation. Delicate blooms are individually wrapped and secured to prevent movement. We use eco-friendly materials throughout our packaging process.",
            },
            {
                q: "Do you deliver internationally?",
                a: "Currently we deliver within Vietnam (Ho Chi Minh City and Hanoi) with same-day options available. International shipping is available for dried and preserved arrangements only. Please contact our concierge for bespoke international orders.",
            },
        ],
    },
    {
        id: "care",
        icon: Flower2,
        title: "Flower Care & Longevity",
        items: [
            {
                q: "How do I keep my bouquet fresh for longer?",
                a: "Trim the stems at a 45° angle under running water and place in a clean vase with fresh, cool water. Keep away from direct sunlight, heat sources, and ripening fruit. Change the water every two days and re-trim the stems each time. Our bouquets come with a care card with specific instructions for each flower variety.",
            },
            {
                q: "My flowers arrived in bud form. Is this normal?",
                a: "Absolutely — this is intentional. We send flowers in bud form so they bloom beautifully in your home over several days, extending their lifespan. Place them in a warm room with indirect light to encourage opening. Most buds will fully bloom within 24–48 hours.",
            },
            {
                q: "Which flowers last the longest?",
                a: "Chrysanthemums, alstroemeria, and carnations typically last 2–3 weeks with proper care. Roses and lilies last 1–2 weeks. We include a longevity guide with every arrangement, and our website has detailed care guides for each flower type.",
            },
        ],
    },
    {
        id: "returns",
        icon: RotateCcw,
        title: "Returns & Cancellations",
        items: [
            {
                q: "What is your freshness guarantee?",
                a: "We guarantee all flowers will be fresh and vibrant for a minimum of 5 days from delivery when cared for properly. If you're not satisfied with the quality of your arrangement, contact us within 24 hours of delivery with a photo and we'll arrange a replacement or full refund.",
            },
            {
                q: "Can I cancel or modify my order?",
                a: "Orders can be cancelled or modified up to 4 hours before the scheduled delivery time. For bespoke and event orders, cancellations must be made at least 48 hours in advance. Please contact our concierge team directly for urgent changes.",
            },
        ],
    },
];

/* ─────────────────────────────────────────────
   Accordion Item
───────────────────────────────────────────── */
function AccordionItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="bg-white rounded-[12px] overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[#faf9f7] transition-colors"
            >
                <span
                    className="text-[#1b1c1a] text-[18px] font-semibold leading-[28px]"
                    style={{ fontFamily: "var(--font-inter)" }}
                >
                    {q}
                </span>
                <ChevronDown
                    className={`w-5 h-5 text-[#817474] shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>
            {open && (
                <div className="px-6 pb-6">
                    <p
                        className="text-[#4f4444] text-[16px] leading-[26px]"
                        style={{ fontFamily: "var(--font-inter)" }}
                    >
                        {a}
                    </p>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function FaqPage() {
    const [search, setSearch] = useState("");

    const filtered = FAQ_SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter(
            (item) =>
                !search ||
                item.q.toLowerCase().includes(search.toLowerCase()) ||
                item.a.toLowerCase().includes(search.toLowerCase())
        ),
    })).filter((s) => s.items.length > 0);

    return (
        <div className="bg-[#fbf9f5] min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
                <div className="max-w-[1280px] mx-auto px-24 pt-32 pb-24 flex flex-col gap-20">

                    {/* ── Hero Search ── */}
                    <section className="flex flex-col items-center gap-8">
                        <h1
                            className="text-[#1b1c1a] text-[60px] font-normal leading-[60px] tracking-[-1.5px] text-center"
                            style={{ fontFamily: "var(--font-noto-serif)" }}
                        >
                            How may we assist your bloom?
                        </h1>
                        <div className="relative w-[672px]">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Search className="w-5 h-5 text-[#817474]" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search for flower care, delivery times, or orders..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white rounded-full pl-16 pr-8 py-6 text-[18px] text-[#1b1c1a] placeholder-[rgba(129,116,116,0.6)] outline-none shadow-[0px_20px_40px_0px_rgba(27,28,26,0.04)] focus:ring-2 focus:ring-[rgba(125,86,45,0.15)] transition-all"
                                style={{ fontFamily: "var(--font-inter)" }}
                            />
                        </div>
                    </section>

                    {/* ── Main Grid: FAQ + Sidebar ── */}
                    <section className="flex gap-0 items-start">

                        {/* Left: FAQ Accordions */}
                        <div className="flex-1 flex flex-col gap-16 pb-12">
                            {filtered.length === 0 ? (
                                <div className="text-center py-16">
                                    <p className="text-[#817474] text-[18px]" style={{ fontFamily: "var(--font-inter)" }}>
                                        No results found for &ldquo;{search}&rdquo;
                                    </p>
                                </div>
                            ) : (
                                filtered.map((section) => {
                                    const Icon = section.icon;
                                    return (
                                        <div key={section.id} className="flex flex-col gap-8">
                                            {/* Section heading */}
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-7 h-5 text-[#7d562d]" />
                                                <h2
                                                    className="text-[#1b1c1a] text-[30px] font-normal leading-[36px]"
                                                    style={{ fontFamily: "var(--font-noto-serif)" }}
                                                >
                                                    {section.title}
                                                </h2>
                                            </div>
                                            {/* Accordion items */}
                                            <div className="flex flex-col gap-4">
                                                {section.items.map((item) => (
                                                    <AccordionItem key={item.q} q={item.q} a={item.a} />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Right: Sidebar */}
                        <div className="w-[330px] shrink-0 ml-8 flex flex-col gap-8">

                            {/* Concierge CTA Card */}
                            <div
                                className="relative bg-[#f5f3ef] border border-[rgba(210,195,195,0.1)] rounded-[24px] p-8 flex flex-col gap-6 overflow-hidden"
                            >
                                {/* Arch decoration */}
                                <div
                                    className="absolute bottom-0 right-4 w-[228px] h-[228px] rounded-t-full bg-[rgba(125,86,45,0.05)] pointer-events-none"
                                />
                                <div className="relative z-10 flex flex-col gap-4">
                                    <h3
                                        className="text-[#1b1c1a] text-[24px] font-normal leading-[32px]"
                                        style={{ fontFamily: "var(--font-noto-serif)" }}
                                    >
                                        Speak with our Floral Concierge
                                    </h3>
                                    <p
                                        className="text-[#4f4444] text-[16px] leading-[26px]"
                                        style={{ fontFamily: "var(--font-inter)" }}
                                    >
                                        Need help choosing the perfect arrangement or tracking a bespoke order? Our experts are here for you.
                                    </p>
                                </div>
                                <div className="relative z-10 flex flex-col gap-4">
                                    <Link
                                        href="/contact"
                                        className="flex items-center justify-center gap-3 w-full py-4 rounded-full bg-gradient-to-b from-[#7d562d] to-[#7e572d] text-white text-[16px] font-semibold shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] hover:opacity-90 transition-opacity"
                                        style={{ fontFamily: "var(--font-inter)" }}
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        Live Boutique Chat
                                    </Link>
                                    <button
                                        className="flex items-center justify-center gap-3 w-full py-4 rounded-full bg-[#e4e2de] text-[#1b1c1a] text-[16px] font-semibold hover:bg-[#d8d5d0] transition-colors"
                                        style={{ fontFamily: "var(--font-inter)" }}
                                    >
                                        <Phone className="w-5 h-5" />
                                        1-800-BOTANIC
                                    </button>
                                </div>
                            </div>

                            {/* Visual Accent Card */}
                            <div className="bg-white rounded-[24px] shadow-[0px_20px_40px_0px_rgba(27,28,26,0.04)] overflow-hidden flex flex-col gap-6 pb-6">
                                <div className="w-full h-[256px] rounded-t-[293px] overflow-hidden">
                                    <Image
                                        src="/images/faq/faq-floral-accent-1625cd.png"
                                        alt="Floral accent"
                                        width={330}
                                        height={256}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <p
                                    className="text-[#4f4444] text-[16px] leading-[24px] text-center px-6"
                                    style={{ fontFamily: "var(--font-noto-serif)" }}
                                >
                                    &ldquo;Flowers are the music of the ground. From earth&apos;s lips spoken without sound.&rdquo;
                                </p>
                            </div>

                        </div>
                    </section>

                </div>
            </main>

            {/* Simple Footer */}
            <footer className="bg-[#f5f3ef] border-t border-[rgba(210,195,195,0.1)] px-8 py-16">
                <div className="max-w-[1280px] mx-auto flex items-center justify-between">
                    <span
                        className="text-[#292524] text-[20px] font-normal"
                        style={{ fontFamily: "var(--font-noto-serif)" }}
                    >
                        Floral Boutique
                    </span>
                    <div className="flex items-center gap-8">
                        {[
                            { label: "Privacy Policy", href: "/privacy-policy" },
                            { label: "Terms of Service", href: "/terms-of-service" },
                            { label: "Sustainability", href: "#" },
                        ].map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="text-[#4f4444] text-[14px] font-semibold tracking-[1.4px] uppercase hover:text-[#1b1c1a] transition-colors"
                                style={{ fontFamily: "var(--font-inter)" }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Social icons placeholder */}
                        {["instagram", "facebook", "pinterest"].map((s) => (
                            <Link
                                key={s}
                                href="#"
                                aria-label={s}
                                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-[#ede9e3] transition-colors"
                            >
                                <span className="w-5 h-5 bg-[#4f4444] rounded-sm opacity-40" />
                            </Link>
                        ))}
                    </div>
                </div>
            </footer>

        </div>
    );
}
