"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, Suspense } from "react";
import { Flower2, Mail, ArrowLeft } from "lucide-react";
import { Navbar, Footer } from "@/components/layout";

/* ─────────────────────────────────────────────
   Forgot Password Form
───────────────────────────────────────────── */
function ForgotPasswordFormContent() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        setLoading(true);
        try {
            // TODO: integrate with real API endpoint
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
            <div className="flex flex-col items-center w-full text-center">
                {/* Brand */}
                <BrandHeader />

                {/* Success Card */}
                <div
                    className="w-full rounded-[12px] bg-white shadow-[0px_20px_40px_0px_rgba(27,28,26,0.04)] px-10 py-10 flex flex-col items-center gap-4"
                >
                    <div className="w-14 h-14 rounded-full bg-[#f5f3ef] flex items-center justify-center mb-2">
                        <Mail className="w-7 h-7 text-[#7d562d]" />
                    </div>
                    <h2
                        className="text-[#1b1c1a] text-[24px] font-normal leading-[32px]"
                        style={{ fontFamily: "var(--font-noto-serif)" }}
                    >
                        Check your inbox
                    </h2>
                    <p
                        className="text-[#4f4444] text-[14px] leading-[22.75px] text-center"
                        style={{ fontFamily: "var(--font-inter)" }}
                    >
                        Recovery instructions have been sent to{" "}
                        <span className="font-semibold">{email}</span>. Please check your
                        email.
                    </p>
                    <button
                        onClick={() => router.push("/signin")}
                        className="mt-4 w-full relative rounded-full bg-gradient-to-b from-[#7d562d] to-[#7e572d] py-4 text-white text-[16px] font-semibold shadow-[0px_10px_15px_-3px_rgba(125,86,45,0.1),0px_4px_6px_-4px_rgba(125,86,45,0.1)] hover:opacity-90 transition-opacity"
                        style={{ fontFamily: "var(--font-inter)" }}
                    >
                        Back to Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full">
            {/* Brand */}
            <BrandHeader />

            {/* Recovery Card */}
            <div className="w-full rounded-[12px] bg-white shadow-[0px_20px_40px_0px_rgba(27,28,26,0.04)] px-10 pt-10 pb-14 flex flex-col gap-8">
                {/* Heading */}
                <div className="flex flex-col items-center gap-[10.75px]">
                    <h2
                        className="text-[#1b1c1a] text-[24px] font-normal leading-[32px] text-center"
                        style={{ fontFamily: "var(--font-noto-serif)" }}
                    >
                        Forgot Password
                    </h2>
                    <p
                        className="text-[#4f4444] text-[14px] leading-[22.75px] text-center"
                        style={{ fontFamily: "var(--font-inter)" }}
                    >
                        Enter the email address associated with your
                        <br />
                        account and we&apos;ll send you recovery
                        <br />
                        instructions.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Email Input Group */}
                    <div className="flex flex-col items-end gap-2">
                        <label
                            className="w-full text-[#4f4444] text-[12px] font-semibold tracking-[0.6px] uppercase"
                            style={{ fontFamily: "var(--font-inter)" }}
                        >
                            Email Address
                        </label>
                        <div className="relative w-full">
                            {/* Mail icon */}
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Mail className="w-4 h-4 text-[#817474]" />
                            </div>
                            <input
                                type="email"
                                placeholder="flower@atelier.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#f5f3ef] rounded-[12px] pl-11 pr-4 pt-[17px] pb-[18px] text-[14px] text-[#1b1c1a] placeholder-[rgba(129,116,116,0.6)] outline-none focus:ring-2 focus:ring-[rgba(125,86,45,0.2)] transition-all"
                                style={{ fontFamily: "var(--font-inter)" }}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="relative w-full rounded-full bg-gradient-to-b from-[#7d562d] to-[#7e572d] py-4 text-white text-[16px] font-semibold shadow-[0px_10px_15px_-3px_rgba(125,86,45,0.1),0px_4px_6px_-4px_rgba(125,86,45,0.1)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontFamily: "var(--font-inter)" }}
                    >
                        {loading ? "Sending..." : "Send Recovery Instructions"}
                    </button>
                </form>
            </div>

            {/* Footer Links */}
            <div className="mt-8 flex flex-col items-center gap-4">
                <Link
                    href="/signin"
                    className="flex items-center gap-2 text-[#52634c] text-[14px] font-medium hover:opacity-70 transition-opacity"
                    style={{ fontFamily: "var(--font-inter)" }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>

                {/* Decorative floral thumbnails */}
                <div className="flex items-end gap-8 pt-12">
                    <div className="w-24 h-32 rounded-t-full bg-white/30 overflow-hidden">
                        <div className="w-full h-full bg-[#f5f3ef] rounded-t-full" />
                    </div>
                    <div className="w-24 h-32 rounded-t-full bg-white/30 overflow-hidden mt-6">
                        <div className="w-full h-full bg-[#f5f3ef] rounded-t-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Brand Header (shared)
───────────────────────────────────────────── */
function BrandHeader() {
    return (
        <div className="flex flex-col items-center mb-12">
            {/* Flower image overlay */}
            <div className="relative w-16 h-[184px] mb-0">
                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-16 h-full rounded-t-full bg-[rgba(255,209,166,0.4)] flex items-end justify-center pb-2">
                    <Flower2 className="w-7 h-8 text-[#7d562d]" />
                </div>
            </div>
            {/* Brand name */}
            <h1
                className="text-[#1b1c1a] text-[30px] font-bold leading-[36px] tracking-[-0.75px] text-center"
                style={{ fontFamily: "var(--font-noto-serif)" }}
            >
                Floral Boutique
            </h1>
            <p
                className="text-[rgba(79,68,68,0.8)] text-[14px] text-center mt-1"
                style={{ fontFamily: "var(--font-inter)" }}
            >
                The Botanical Atelier
            </p>
        </div>
    );
}

function ForgotPasswordForm() {
    return (
        <Suspense
            fallback={
                <div className="flex flex-col items-center w-full">
                    <div className="animate-pulse text-[#4f4444]">Loading...</div>
                </div>
            }
        >
            <ForgotPasswordFormContent />
        </Suspense>
    );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function ForgotPasswordPage() {
    return (
        <div className="bg-[#fbf9f5] min-h-screen flex flex-col">
            <Navbar />

            {/* Background accent (subtle) */}
            <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden -z-0">
                <div className="absolute -left-40 -top-40 w-[759px] h-[759px] rounded-full bg-[#eae8e4]" />
                <div className="absolute right-0 bottom-0 w-[569px] h-[569px] rounded-full bg-[rgba(210,229,200,0.3)]" />
            </div>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-12 px-6">
                <div className="w-full max-w-[448px]">
                    <ForgotPasswordForm />
                </div>

                {/* Support text */}
                <p
                    className="mt-8 text-[rgba(79,68,68,0.5)] text-[12px] tracking-[0.3px] text-center"
                    style={{ fontFamily: "var(--font-inter)" }}
                >
                    Having trouble? Contact our concierge at support@floralboutique.com
                </p>
            </main>

            <Footer />
        </div>
    );
}
