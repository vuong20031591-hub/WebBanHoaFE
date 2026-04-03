"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";
import { Navbar, Footer } from "@/components/layout";

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const SERVICES = [
    {
        id: "weddings",
        title: "Bespoke Weddings",
        description:
            "Complete sensory environments designed to reflect your unique union. We manage everything from bridal party florals to complex venue installations.",
        linkText: "Explore Weddings",
        href: "/contact",
        image: "/images/events/bespoke-weddings-645d54.png",
        offsetTop: false,
    },
    {
        id: "corporate",
        title: "Corporate Events",
        description:
            "Elevate your brand presence with curated botanical designs. Ideal for product launches, brand dinners, and luxury retail installations.",
        linkText: "View Portfolio",
        href: "/contact",
        image: "/images/events/corporate-events-645d54.png",
        offsetTop: true,
    },
    {
        id: "workshops",
        title: "Artisan Workshops",
        description:
            "Master the art of floristry in our boutique studio. From seasonal wreath making to professional bouquet composition techniques.",
        linkText: "Book a Seat",
        href: "/contact",
        image: "/images/events/artisan-workshops-53a4f8.png",
        offsetTop: false,
    },
];

const EVENT_TYPES = [
    "Bespoke Wedding",
    "Corporate Event",
    "Artisan Workshop",
    "Private Celebration",
    "Other",
];

/* ─────────────────────────────────────────────
   Inquiry Form
───────────────────────────────────────────── */
function InquiryForm() {
    const [form, setForm] = useState({
        name: "", email: "", eventType: EVENT_TYPES[0], eventDate: "", vision: "",
    });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1000));
        setLoading(false);
        setSent(true);
    };

    if (sent) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-[#efeeea] flex items-center justify-center">
                    <Mail className="w-8 h-8 text-[#1b1c1a]" />
                </div>
                <p className="text-[#1b1c1a] text-[20px]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                    We&apos;ll be in touch within 48 hours.
                </p>
                <button
                    onClick={() => setSent(false)}
                    className="text-[#52634c] text-[14px] font-medium underline underline-offset-2"
                >
                    Send another inquiry
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* Row 1: Name + Email */}
            <div className="flex gap-6">
                <FormField label="Full Name">
                    <input
                        type="text" placeholder="Your full name" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full h-14 bg-[#efeeea] rounded-[12px] px-4 text-[16px] text-[#1b1c1a] placeholder-[#9ca3af] outline-none focus:ring-2 focus:ring-[rgba(125,86,45,0.2)] transition-all"
                        style={{ fontFamily: "var(--font-inter)" }}
                    />
                </FormField>
                <FormField label="Email Address">
                    <input
                        type="email" placeholder="your@email.com" value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full h-14 bg-[#efeeea] rounded-[12px] px-4 text-[16px] text-[#1b1c1a] placeholder-[#9ca3af] outline-none focus:ring-2 focus:ring-[rgba(125,86,45,0.2)] transition-all"
                        style={{ fontFamily: "var(--font-inter)" }}
                    />
                </FormField>
            </div>

            {/* Row 2: Event Type + Event Date */}
            <div className="flex gap-6">
                <FormField label="Event Type">
                    <div className="relative">
                        <select
                            value={form.eventType}
                            onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                            className="w-full h-14 bg-[#efeeea] rounded-[12px] px-4 text-[16px] text-[#1b1c1a] appearance-none outline-none focus:ring-2 focus:ring-[rgba(125,86,45,0.2)] transition-all cursor-pointer"
                            style={{ fontFamily: "var(--font-inter)" }}
                        >
                            {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </FormField>
                <FormField label="Event Date">
                    <input
                        type="date" value={form.eventDate}
                        onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                        className="w-full h-14 bg-[#efeeea] rounded-[12px] px-4 text-[16px] text-[#1b1c1a] outline-none focus:ring-2 focus:ring-[rgba(125,86,45,0.2)] transition-all"
                        style={{ fontFamily: "var(--font-inter)" }}
                    />
                </FormField>
            </div>

            {/* Vision textarea */}
            <FormField label="Tell us your vision">
                <textarea
                    placeholder="Describe your dream event..."
                    value={form.vision}
                    onChange={(e) => setForm({ ...form, vision: e.target.value })}
                    rows={5}
                    className="w-full bg-[#efeeea] rounded-[12px] px-4 py-4 text-[16px] text-[#1b1c1a] placeholder-[#9ca3af] outline-none focus:ring-2 focus:ring-[rgba(125,86,45,0.2)] transition-all resize-none"
                    style={{ fontFamily: "var(--font-inter)" }}
                />
            </FormField>

            {/* Submit */}
            <button
                type="submit" disabled={loading}
                className="w-full py-5 rounded-full bg-[#1b1c1a] text-[#fbf9f5] text-[18px] font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-inter)" }}
            >
                {loading ? "Sending..." : "Send Inquiry"}
            </button>
        </form>
    );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2 flex-1">
            <label
                className="text-[#4f4444] text-[14px] font-medium"
                style={{ fontFamily: "var(--font-inter)" }}
            >
                {label}
            </label>
            {children}
        </div>
    );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function EventsWeddingsPage() {
    return (
        <div className="bg-[#fbf9f5] min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">

                {/* ── Hero Section ── */}
                <section className="flex items-center justify-center gap-16 px-8 pt-20 pb-0">
                    {/* Left: Text */}
                    <div className="flex flex-col gap-8 flex-1 max-w-[512px]">
                        <h1
                            className="text-[#1b1c1a] text-[72px] font-normal leading-[72px]"
                            style={{ fontFamily: "var(--font-noto-serif)" }}
                        >
                            Moments<br />Transformed
                        </h1>
                        <p
                            className="text-[#4f4444] text-[18px] font-normal leading-[29.25px] max-w-[493px]"
                            style={{ fontFamily: "var(--font-inter)" }}
                        >
                            We weave botanical narratives for life&apos;s most significant
                            celebrations. From intimate vows to grand galas, our floral
                            design tells your story with ephemeral beauty.
                        </p>
                        <div className="pt-4">
                            <Link
                                href="#inquiry"
                                className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-gradient-to-b from-[#7d562d] to-[#7e572d] text-white text-[18px] font-medium hover:opacity-90 transition-opacity"
                                style={{ fontFamily: "var(--font-inter)" }}
                            >
                                Inquire for your Date
                            </Link>
                        </div>
                    </div>

                    {/* Right: Hero bouquet image */}
                    <div className="relative flex-1 max-w-[560px]">
                        <div className="rounded-t-[144px] overflow-hidden shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] bg-[#f5f3ef]">
                            <Image
                                src="/images/events/hero-bouquet-543c57.png"
                                alt="Hero bouquet"
                                width={560}
                                height={720}
                                className="w-full object-cover"
                                priority
                            />
                        </div>
                    </div>
                </section>

                {/* ── Services Grid ── */}
                <section className="bg-[#f5f3ef] px-8 py-32">
                    <div className="max-w-[1216px] mx-auto grid grid-cols-3 gap-0">
                        {SERVICES.map((service) => (
                            <div
                                key={service.id}
                                className="flex flex-col"
                                style={{ marginTop: service.offsetTop ? "96px" : "0" }}
                            >
                                {/* Image */}
                                <div className="rounded-t-[93px] overflow-hidden" style={{ aspectRatio: "3/4" }}>
                                    <Image
                                        src={service.image}
                                        alt={service.title}
                                        width={373}
                                        height={498}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {/* Text */}
                                <div className="pt-8 flex flex-col gap-4">
                                    <h3
                                        className="text-[#1b1c1a] text-[30px] font-normal leading-[36px]"
                                        style={{ fontFamily: "var(--font-noto-serif)" }}
                                    >
                                        {service.title}
                                    </h3>
                                    <p
                                        className="text-[#4f4444] text-[16px] leading-[26px]"
                                        style={{ fontFamily: "var(--font-inter)" }}
                                    >
                                        {service.description}
                                    </p>
                                    <Link
                                        href={service.href}
                                        className="flex items-center gap-2 text-[#52634c] text-[16px] font-medium hover:opacity-70 transition-opacity"
                                        style={{ fontFamily: "var(--font-inter)" }}
                                    >
                                        {service.linkText}
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Testimonial ── */}
                <section className="flex flex-col items-center px-8 py-32 pb-64">
                    {/* Decorative leaf icon */}
                    <div className="mb-8 text-[#7d562d]">
                        <svg width="33" height="40" viewBox="0 0 33 40" fill="none">
                            <path
                                d="M16.5 2C16.5 2 4 10 4 22C4 30.837 9.716 38 16.5 38C23.284 38 29 30.837 29 22C29 10 16.5 2 16.5 2Z"
                                fill="#7D562D" fillOpacity="0.15" stroke="#7D562D" strokeWidth="1.5"
                            />
                            <path d="M16.5 38V14" stroke="#7D562D" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>

                    <blockquote
                        className="text-[#1b1c1a] text-[48px] font-normal leading-[48px] text-center max-w-[868px]"
                        style={{ fontFamily: "var(--font-noto-serif)" }}
                    >
                        &ldquo;The florals were not just decor; they were a
                        living, breathing part of our ceremony. Every
                        petal felt intentional and profoundly
                        beautiful.&rdquo;
                    </blockquote>

                    <p
                        className="mt-8 text-[#52634c] text-[14px] font-semibold tracking-[2.8px] uppercase text-center"
                        style={{ fontFamily: "var(--font-inter)" }}
                    >
                        — Eleanor &amp; James, Cotswolds 2023
                    </p>
                </section>

                {/* ── Inquiry Form Section ── */}
                <section id="inquiry" className="px-8 pb-32">
                    <div
                        className="max-w-[1216px] mx-auto bg-white rounded-[40px] shadow-[0px_20px_40px_0px_rgba(27,28,26,0.04)] p-20 flex gap-20"
                    >
                        {/* Left: Heading + contact info */}
                        <div className="flex flex-col gap-8 flex-1">
                            <h2
                                className="text-[#1b1c1a] text-[48px] font-normal leading-[48px]"
                                style={{ fontFamily: "var(--font-noto-serif)" }}
                            >
                                Let&apos;s start your story.
                            </h2>
                            <p
                                className="text-[#4f4444] text-[18px] leading-[29.25px]"
                                style={{ fontFamily: "var(--font-inter)" }}
                            >
                                Whether you have a fully realized vision or just a feeling
                                you want to capture, we are here to help bring it to life.
                                Fill out our inquiry form and we&apos;ll be in touch within 48
                                hours.
                            </p>
                            <div className="flex flex-col gap-6 pt-4">
                                <div className="flex items-center gap-4">
                                    <Mail className="w-5 h-5 text-[#1b1c1a] shrink-0" />
                                    <span
                                        className="text-[#1b1c1a] text-[16px] font-medium"
                                        style={{ fontFamily: "var(--font-inter)" }}
                                    >
                                        atelier@floralboutique.com
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <MapPin className="w-5 h-5 text-[#1b1c1a] shrink-0" />
                                    <span
                                        className="text-[#1b1c1a] text-[16px] font-medium"
                                        style={{ fontFamily: "var(--font-inter)" }}
                                    >
                                        The Botanical Mews, London SW1
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Form */}
                        <div className="flex-1">
                            <InquiryForm />
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
