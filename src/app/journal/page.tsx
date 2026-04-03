"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Navbar, Footer } from "@/components/layout";

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const POSTS = [
    {
        id: 1,
        category: "Sustainability",
        title: "The Art of Drying Wildflowers",
        excerpt:
            "Preserving the ephemeral beauty of your bouquet through traditional pressing and air-drying techniques.",
        author: "Clara Vane",
        image: "/images/journal/post-wildflowers-1238a9.png",
        href: "#",
    },
    {
        id: 2,
        category: "Technique",
        title: "Mastering Negative Space",
        excerpt:
            "Why the flowers you don't use are just as important as the ones you do in contemporary Ikebana.",
        author: "Julian Thorne",
        image: "/images/journal/post-negative-space-1238a9.png",
        href: "#",
    },
    {
        id: 3,
        category: "Lifestyle",
        title: "A Morning in the Greenhouse",
        excerpt:
            "Behind the scenes of our botanical nursery where the rarest orchids and ferns begin their journey.",
        author: "Elena Rossi",
        image: "/images/journal/post-greenhouse-643d3d.png",
        href: "#",
    },
];

/* ─────────────────────────────────────────────
   Article Card
───────────────────────────────────────────── */
function ArticleCard({ post }: { post: typeof POSTS[0] }) {
    return (
        <Link href={post.href} className="flex flex-col gap-6 group">
            {/* Image */}
            <div className="bg-[#f5f3ef] rounded-t-[357px] overflow-hidden" style={{ aspectRatio: "3/4" }}>
                <Image
                    src={post.image}
                    alt={post.title}
                    width={373}
                    height={519}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>
            {/* Text */}
            <div className="flex flex-col gap-3 px-2">
                <span
                    className="text-[#52634c] text-[12px] tracking-[1.2px] uppercase"
                    style={{ fontFamily: "var(--font-inter)" }}
                >
                    {post.category}
                </span>
                <h3
                    className="text-[#1b1c1a] text-[24px] font-normal leading-[32px] group-hover:text-[#7d562d] transition-colors"
                    style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                    {post.title}
                </h3>
                <p
                    className="text-[#4f4444] text-[14px] leading-[20px]"
                    style={{ fontFamily: "var(--font-inter)" }}
                >
                    {post.excerpt}
                </p>
                <div className="flex items-center gap-2 pt-1">
                    <div className="w-6 h-6 rounded-full bg-[#efd4c6] shrink-0" />
                    <span
                        className="text-[#1b1c1a] text-[12px] font-medium"
                        style={{ fontFamily: "var(--font-inter)" }}
                    >
                        By {post.author}
                    </span>
                </div>
            </div>
        </Link>
    );
}

/* ─────────────────────────────────────────────
   Newsletter
───────────────────────────────────────────── */
function Newsletter() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        await new Promise((r) => setTimeout(r, 600));
        setSubscribed(true);
    };

    return (
        <section className="bg-[#f5f3ef] rounded-[40px] px-20 py-20 flex flex-col items-center gap-6">
            <h2
                className="text-[#1b1c1a] text-[36px] font-normal leading-[40px] text-center"
                style={{ fontFamily: "var(--font-noto-serif)" }}
            >
                Receive our Seasonal<br />Botanical Briefing
            </h2>
            <p
                className="text-[#4f4444] text-[16px] leading-[26px] text-center max-w-[644px]"
                style={{ fontFamily: "var(--font-inter)" }}
            >
                Join our inner circle for exclusive early access to rare collections, flower care guides,
                and boutique invitations.
            </p>

            {subscribed ? (
                <p className="text-[#52634c] text-[16px] font-medium" style={{ fontFamily: "var(--font-inter)" }}>
                    Thank you for subscribing!
                </p>
            ) : (
                <form onSubmit={handleSubmit} className="flex gap-4 w-full max-w-[560px] pt-2">
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-white rounded-full px-8 py-[18px] text-[16px] text-[#1b1c1a] placeholder-[#d2c3c3] outline-none focus:ring-2 focus:ring-[rgba(125,86,45,0.2)] transition-all"
                        style={{ fontFamily: "var(--font-inter)" }}
                    />
                    <button
                        type="submit"
                        className="px-10 py-[18px] rounded-full bg-gradient-to-b from-[#7d562d] to-[#7e572d] text-white text-[16px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                        style={{ fontFamily: "var(--font-inter)" }}
                    >
                        Subscribe
                    </button>
                </form>
            )}

            <p
                className="text-[#817474] text-[10px] tracking-[1px] uppercase"
                style={{ fontFamily: "var(--font-inter)" }}
            >
                Privacy respected. Unsubscribe at any time.
            </p>
        </section>
    );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function JournalPage() {
    return (
        <div className="bg-[#fbf9f5] min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
                <div className="max-w-[1280px] mx-auto px-6 pt-28 pb-20 flex flex-col gap-20">

                    {/* ── Editorial Header ── */}
                    <section className="flex flex-col items-center gap-4">
                        <span
                            className="text-[#52634c] text-[14px] tracking-[1.4px] uppercase"
                            style={{ fontFamily: "var(--font-inter)" }}
                        >
                            The Journal
                        </span>
                        <h1
                            className="text-[#1b1c1a] text-[72px] font-normal leading-[72px] text-center"
                            style={{ fontFamily: "var(--font-noto-serif)" }}
                        >
                            The Botanical<br />Atelier
                        </h1>
                        <p
                            className="text-[#4f4444] text-[18px] leading-[28px] text-center max-w-[576px] pt-2"
                            style={{ fontFamily: "var(--font-inter)" }}
                        >
                            A curated collection of botanical insights, seasonal inspirations,
                            and the art of floral design.
                        </p>
                    </section>

                    {/* ── Featured Article ── */}
                    <section className="flex gap-0 items-stretch min-h-[500px]">
                        {/* Left: image */}
                        <div className="flex-1 bg-[#f5f3ef] rounded-t-[393px] overflow-hidden">
                            <Image
                                src="/images/journal/featured-peonies-8e4956.png"
                                alt="The Language of Seasonal Peonies"
                                width={747}
                                height={437}
                                className="w-full h-full object-cover"
                                priority
                            />
                        </div>

                        {/* Right: content */}
                        <div className="flex-1 flex flex-col justify-center gap-6 pl-16 pr-4">
                            <div className="flex items-center gap-4">
                                <span className="bg-[#52634c] text-[#d2e5c8] text-[14px] px-3 py-1 rounded-full" style={{ fontFamily: "var(--font-inter)" }}>
                                    New Release
                                </span>
                                <span className="text-[#4f4444] text-[14px]" style={{ fontFamily: "var(--font-inter)" }}>
                                    June 12, 2024
                                </span>
                            </div>
                            <h2
                                className="text-[#1b1c1a] text-[48px] font-normal leading-[48px]"
                                style={{ fontFamily: "var(--font-noto-serif)" }}
                            >
                                The Language of<br />Seasonal Peonies
                            </h2>
                            <p
                                className="text-[#4f4444] text-[18px] leading-[29.25px]"
                                style={{ fontFamily: "var(--font-inter)" }}
                            >
                                Explore the delicate history and symbolic depth of
                                the season&apos;s most beloved bloom. From the palace
                                gardens of the East to the modern bridal bouquet,
                                the peony remains a timeless icon of grace.
                            </p>
                            <Link
                                href="#"
                                className="flex items-center gap-2 text-[#7d562d] text-[18px] font-medium hover:opacity-70 transition-opacity pt-2"
                                style={{ fontFamily: "var(--font-inter)" }}
                            >
                                Continue Reading
                                <ArrowUpRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </section>

                    {/* ── Recent Entries Grid ── */}
                    <section className="flex flex-col gap-12">
                        <div className="flex items-end justify-between">
                            <h2
                                className="text-[#1b1c1a] text-[30px] font-normal leading-[36px]"
                                style={{ fontFamily: "var(--font-noto-serif)" }}
                            >
                                Recent Entries
                            </h2>
                            <Link
                                href="#"
                                className="flex items-center gap-1 text-[#52634c] text-[14px] font-medium hover:opacity-70 transition-opacity"
                                style={{ fontFamily: "var(--font-inter)" }}
                            >
                                View all
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-3 gap-8">
                            {POSTS.map((post) => (
                                <ArticleCard key={post.id} post={post} />
                            ))}
                        </div>
                    </section>

                    {/* ── Newsletter ── */}
                    <Newsletter />

                </div>
            </main>

            <Footer />
        </div>
    );
}
