"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, ArrowUpRight, Instagram, Facebook, Twitter } from "lucide-react";
import { Navbar, Footer } from "@/components/layout";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
const SUBJECTS = [
    "Event Inquiry",
    "Wedding Arrangement",
    "Corporate Order",
    "Custom Design",
    "General Question",
];

const ATELIERS = [
    {
        city: "Saigon",
        name: "District 1 Atelier",
        address: "126 Dong Khoi Street, Ben Nghe Ward,\nDistrict 1, Ho Chi Minh City",
        image: "/images/contact/saigon-atelier-1a7a05.png",
        mapsUrl: "https://maps.google.com/?q=126+Dong+Khoi+Street+Ho+Chi+Minh+City",
    },
    {
        city: "Hanoi",
        name: "Old Quarter Store",
        address: "45 Ly Quoc Su, Hoan Kiem District,\nHanoi Capital",
        image: "/images/contact/hanoi-atelier-1a7a05.png",
        mapsUrl: "https://maps.google.com/?q=45+Ly+Quoc+Su+Hanoi",
    },
];

/* ─────────────────────────────────────────────
   Contact Form
───────────────────────────────────────────── */
function ContactForm() {
    const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], message: "" });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            // TODO: integrate with real API
            await new Promise((res) => setTimeout(res, 1000));
            setSent(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-[#f5f3ef] flex items-center justify-center">
                    <Mail className="w-8 h-8 text-[#7d562d]" />
                </div>
                <h3
                    className="text-[#1b1c1a] text-[24px] font-normal"
                    style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                    Inquiry Sent
                </h3>
                <p className="text-[#4f4444] text-[16px]" style={{ fontFamily: "var(--font-inter)" }}>
                    Thank you for reaching out. Our team will get back to you shortly.
                </p>
                <button
                    onClick={() => setSent(false)}
                    className="text-[#7d562d] text-[14px] font-medium underline underline-offset-2"
                    style={{ fontFamily: "var(--font-inter)" }}
                >
                    Send another inquiry
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Name + Email row */}
            <div className="flex gap-6">
                <InputField
                    label="Full Name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                />
                <InputField
                    label="Email Address"
                    type="email"
                    placeholder="hello@example.com"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                />
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-2">
                <label
                    className="text-[#817474] text-[12px] font-semibold tracking-[1.2px] uppercase px-1"
                    style={{ fontFamily: "var(--font-inter)" }}
                >
                    Subject
                </label>
                <div className="relative">
                    <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full bg-[#f5f3ef] rounded-[8px] px-4 py-[18px] text-[16px] text-[#1b1c1a] appearance-none outline-none focus:ring-2 focus:ring-[rgba(125,86,45,0.2)] transition-all cursor-pointer"
                        style={{ fontFamily: "var(--font-inter)" }}
                    >
                        {SUBJECTS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    {/* Chevron */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                            <path d="M1 1L6 6L11 1" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-2">
                <label
                    className="text-[#817474] text-[12px] font-semibold tracking-[1.2px] uppercase px-1"
                    style={{ fontFamily: "var(--font-inter)" }}
                >
                    Message
                </label>
                <textarea
                    placeholder="Tell us about your botanical needs..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={6}
                    className="w-full bg-[#f5f3ef] rounded-[8px] px-4 py-4 text-[16px] text-[#1b1c1a] placeholder-[#d2c3c3] outline-none focus:ring-2 focus:ring-[rgba(125,86,45,0.2)] transition-all resize-none"
                    style={{ fontFamily: "var(--font-inter)" }}
                />
            </div>

            {/* Submit */}
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="relative rounded-full bg-gradient-to-b from-[#7d562d] to-[#7e572d] px-12 py-4 text-white text-[16px] font-medium tracking-[0.4px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "var(--font-inter)" }}
                >
                    {loading ? "Sending..." : "Send Inquiry"}
                </button>
            </div>
        </form>
    );
}

/* ─────────────────────────────────────────────
   Reusable Input
───────────────────────────────────────────── */
function InputField({
    label, placeholder, value, onChange, type = "text",
}: {
    label: string; placeholder: string; value: string;
    onChange: (v: string) => void; type?: string;
}) {
    return (
        <div className="flex flex-col gap-2 flex-1">
            <label
                className="text-[#817474] text-[12px] font-semibold tracking-[1.2px] uppercase px-1"
                style={{ fontFamily: "var(--font-inter)" }}
            >
                {label}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-[#f5f3ef] rounded-[8px] px-4 py-[18px] text-[16px] text-[#1b1c1a] placeholder-[#d2c3c3] outline-none focus:ring-2 focus:ring-[rgba(125,86,45,0.2)] transition-all"
                style={{ fontFamily: "var(--font-inter)" }}
            />
        </div>
    );
}

/* ─────────────────────────────────────────────
   Atelier Card
───────────────────────────────────────────── */
function AtelierCard({ atelier }: { atelier: typeof ATELIERS[0] }) {
    return (
        <div className="flex gap-6">
            {/* Image */}
            <div className="w-32 h-44 rounded-t-[32px] overflow-hidden shrink-0">
                <Image
                    src={atelier.image}
                    alt={atelier.name}
                    width={128}
                    height={176}
                    className="w-full h-full object-cover"
                />
            </div>
            {/* Info */}
            <div className="flex flex-col justify-center gap-1">
                <span
                    className="text-[#52634c] text-[14px] font-semibold tracking-[1.4px] uppercase"
                    style={{ fontFamily: "var(--font-inter)" }}
                >
                    {atelier.city}
                </span>
                <h3
                    className="text-[#1b1c1a] text-[20px] font-normal leading-[28px] mb-1"
                    style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                    {atelier.name}
                </h3>
                <p
                    className="text-[#4f4444] text-[14px] leading-[22.75px] whitespace-pre-line"
                    style={{ fontFamily: "var(--font-inter)" }}
                >
                    {atelier.address}
                </p>
                <Link
                    href={atelier.mapsUrl}
                    target="_blank"
                    className="flex items-center gap-2 text-[#7d562d] text-[14px] font-medium mt-2 hover:opacity-70 transition-opacity"
                    style={{ fontFamily: "var(--font-inter)" }}
                >
                    Get Directions
                    <ArrowUpRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function ContactPage() {
    return (
        <div className="bg-[#fbf9f5] min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
                <div className="max-w-[1280px] mx-auto px-12 pt-32 pb-24 flex flex-col gap-24">

                    {/* Hero Section */}
                    <section className="flex flex-col items-center gap-6">
                        <h1
                            className="text-[#1b1c1a] text-[72px] font-normal leading-[72px] tracking-[-1.8px] text-center"
                            style={{ fontFamily: "var(--font-noto-serif)" }}
                        >
                            Reach out to us
                        </h1>
                        <p
                            className="text-[#4f4444] text-[18px] font-light leading-[29.25px] text-center max-w-[650px]"
                            style={{ fontFamily: "var(--font-inter)" }}
                        >
                            Whether you&apos;re looking for a bespoke arrangement or planning a grand event,
                            our artisans are here to bring your botanical vision to life.
                        </p>
                    </section>

                    {/* Main Grid */}
                    <section className="grid grid-cols-[1fr_456px] gap-0 items-start">

                        {/* Left: Contact Form */}
                        <div className="bg-white rounded-[12px] px-12 pt-12 pb-16 flex flex-col gap-8">
                            <h2
                                className="text-[#1b1c1a] text-[30px] font-normal leading-[36px]"
                                style={{ fontFamily: "var(--font-noto-serif)" }}
                            >
                                Get in Touch
                            </h2>
                            <ContactForm />
                        </div>

                        {/* Right: Aside */}
                        <div className="flex flex-col pl-8">

                            {/* Our Ateliers */}
                            <div className="bg-[#f5f3ef] rounded-[12px] p-8 flex flex-col gap-10">
                                <h2
                                    className="text-[#1b1c1a] text-[30px] font-normal leading-[36px]"
                                    style={{ fontFamily: "var(--font-noto-serif)" }}
                                >
                                    Our Ateliers
                                </h2>
                                <div className="flex flex-col gap-12">
                                    {ATELIERS.map((a) => (
                                        <AtelierCard key={a.city} atelier={a} />
                                    ))}
                                </div>
                            </div>

                            {/* Contact Details Card */}
                            <div className="mt-12 bg-[#e4e2de] rounded-[12px] p-8 flex flex-col gap-6">
                                {/* Direct Contact */}
                                <div className="flex flex-col gap-4">
                                    <span
                                        className="text-[#817474] text-[12px] font-semibold tracking-[1.2px] uppercase"
                                        style={{ fontFamily: "var(--font-inter)" }}
                                    >
                                        Direct Contact
                                    </span>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-4">
                                            <Mail className="w-6 h-6 text-[#1b1c1a] shrink-0" />
                                            <span
                                                className="text-[#1b1c1a] text-[18px]"
                                                style={{ fontFamily: "var(--font-inter)" }}
                                            >
                                                hello@floralboutique.vn
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Phone className="w-6 h-6 text-[#1b1c1a] shrink-0" />
                                            <span
                                                className="text-[#1b1c1a] text-[18px]"
                                                style={{ fontFamily: "var(--font-inter)" }}
                                            >
                                                +84 (0) 28 3456 7890
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider + Social */}
                                <div className="border-t border-[rgba(210,195,195,0.3)] pt-6 flex flex-col gap-4">
                                    <span
                                        className="text-[#817474] text-[12px] font-semibold tracking-[1.2px] uppercase"
                                        style={{ fontFamily: "var(--font-inter)" }}
                                    >
                                        Social Presence
                                    </span>
                                    <div className="flex gap-4">
                                        {[
                                            { icon: Instagram, href: "#", label: "Instagram" },
                                            { icon: Facebook, href: "#", label: "Facebook" },
                                            { icon: Twitter, href: "#", label: "Twitter" },
                                        ].map(({ icon: Icon, href, label }) => (
                                            <Link
                                                key={label}
                                                href={href}
                                                aria-label={label}
                                                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-[#f5f3ef] transition-colors"
                                            >
                                                <Icon className="w-5 h-5 text-[#1b1c1a]" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* Decorative Floral Banner */}
                    <section className="relative rounded-[24px] overflow-hidden h-[416px] flex items-center justify-center">
                        <Image
                            src="/images/contact/contact-floral-bg-40e6d4.png"
                            alt="Floral arrangement"
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/30" />
                        <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
                            <h2
                                className="text-white text-[48px] font-normal leading-[48px] max-w-[933px]"
                                style={{ fontFamily: "var(--font-noto-serif)" }}
                            >
                                Crafted with patience, delivered with love.
                            </h2>
                            <p
                                className="text-[rgba(255,255,255,0.8)] text-[14px] font-light tracking-[0.35px] uppercase"
                                style={{ fontFamily: "var(--font-inter)" }}
                            >
                                Since 2012 — The Botanical Atelier
                            </p>
                        </div>
                    </section>

                </div>
            </main>

            <Footer />
        </div>
    );
}
