"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import {
  Flower2,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Navbar, Footer } from "@/components/layout";
import { useAuth } from "@/src/contexts/AuthContext";

/* ─────────────────────────────────────────────
   Asset URLs từ Figma MCP
───────────────────────────────────────────── */
const IMG_SIGNIN_FLOWER = "/images/hero-main.png";



/* ─────────────────────────────────────────────
   Google Icon SVG
───────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z"
        fill="#4285F4"
      />
      <path
        d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z"
        fill="#34A853"
      />
      <path
        d="M4.405 11.9A6.01 6.01 0 014.09 10c0-.663.114-1.305.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z"
        fill="#FBBC05"
      />
      <path
        d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0A9.996 9.996 0 001.064 5.51l3.34 2.59C5.192 5.736 7.396 3.977 10 3.977z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Sign In Form
───────────────────────────────────────────── */
function SignInFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    setLoading(true);
    try {
      await signIn({ email, password }, rememberMe);
      router.push("/");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Brand Logo */}
      <div className="flex items-center gap-1.5 mb-8">
        <Flower2 className="text-[#d0bb95] w-6 h-6" />
        <span
          className="text-[#2d2a26] text-[20px] font-medium tracking-[-0.5px]"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          Floral Boutique
        </span>
      </div>

      {/* Heading */}
      <h1
        className="text-[#0a0a0a] text-[29px] font-medium leading-[36px] mb-8"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        Sign In
      </h1>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-[#364153] text-[13px] font-normal"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Mail className="w-5 h-5 text-[#9ca3af]" />
            </div>
            <input
              type="email"
              placeholder="hotmail@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[50px] pl-[48px] pr-4 border border-[#d1d5dc] rounded-[14px] text-[15px] text-[#0a0a0a] placeholder-[rgba(10,10,10,0.4)] outline-none focus:border-[#d0bb95] focus:ring-1 focus:ring-[rgba(208,187,149,0.3)] transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-[#364153] text-[13px] font-normal"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Lock className="w-5 h-5 text-[#9ca3af]" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[50px] pl-[48px] pr-[48px] border border-[#d1d5dc] rounded-[14px] text-[15px] text-[#0a0a0a] placeholder-[rgba(10,10,10,0.4)] outline-none focus:border-[#d0bb95] focus:ring-1 focus:ring-[rgba(208,187,149,0.3)] transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#5c6b5e] transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-4 h-4 border rounded flex items-center justify-center transition-colors cursor-pointer ${
                rememberMe
                  ? "bg-[#d0bb95] border-[#d0bb95]"
                  : "bg-white border-[#d1d5dc]"
              }`}
            >
              {rememberMe && (
                <svg
                  width="10"
                  height="8"
                  viewBox="0 0 10 8"
                  fill="none"
                >
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span
              className="text-[#4a5565] text-[13px]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Remember me
            </span>
          </label>
          <Link
            href="/forgot-password"
            className="text-[#364153] text-[13px] hover:text-[#d0bb95] transition-colors"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Forgot password?
          </Link>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#d0bb95] text-white text-[15px] font-normal rounded-[14px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] hover:bg-[#c2a571] transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {/* Divider */}
      <div className="w-full flex items-center gap-4 my-5">
        <div className="flex-1 h-px bg-[#d1d5dc]" />
        <span
          className="text-[#6a7282] text-[13px]"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Or sign in with
        </span>
        <div className="flex-1 h-px bg-[#d1d5dc]" />
      </div>

      {/* Social Buttons */}
      <div className="w-full flex gap-3">
        <button
          className="flex-1 h-[46px] border border-[#d1d5dc] rounded-[14px] flex items-center justify-center gap-2 hover:bg-[#f9f9f9] transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <GoogleIcon />
          <span className="text-[#0a0a0a] text-[15px]">Google</span>
        </button>
        <button
          className="flex-1 h-[46px] border border-[#d1d5dc] rounded-[14px] flex items-center justify-center gap-2 hover:bg-[#f9f9f9] transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878V12.89H5.898V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
              fill="#1877F2"
            />
          </svg>
          <span className="text-[#0a0a0a] text-[15px]">Facebook</span>
        </button>
      </div>

      {/* Sign Up Link */}
      <p
        className="mt-6 text-[#4a5565] text-[15px]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-[#d0bb95] font-bold hover:text-[#c2a571] transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

function SignInForm() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center w-full"><div className="animate-pulse">Loading...</div></div>}>
      <SignInFormContent />
    </Suspense>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function SignInPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="max-w-[1280px] w-full mx-auto px-10 flex items-center justify-between gap-16">
          {/* Left: Form */}
          <div className="w-[448px] shrink-0">
            <SignInForm />
          </div>

          {/* Right: Flower Image */}
          <div className="relative w-[360px] h-[440px] shrink-0 rounded-[24px] overflow-hidden shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
            <Image
              src={IMG_SIGNIN_FLOWER}
              alt="Floral arrangement"
              fill
              sizes="360px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
