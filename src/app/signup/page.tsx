"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Flower2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  UserRound,
} from "lucide-react";
import { Navbar, Footer } from "@/components/layout";

/* ─────────────────────────────────────────────
   Asset URLs từ Figma MCP
───────────────────────────────────────────── */
const IMG_SIGNUP_FLOWER = "/images/hero-main.png";



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
   Sign Up Form
───────────────────────────────────────────── */
function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with auth API
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
        className="text-[#0a0a0a] text-[28px] font-medium leading-[36px] mb-8"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        Create Account
      </h1>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-[#364153] text-[13px] font-normal"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Full Name
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <UserRound className="w-5 h-5 text-[#9ca3af]" />
            </div>
            <input
              type="text"
              placeholder="Diamond"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-[50px] pl-[48px] pr-4 border border-[#d1d5dc] rounded-[14px] text-[15px] text-[#0a0a0a] placeholder-[rgba(10,10,10,0.4)] outline-none focus:border-[#d0bb95] focus:ring-1 focus:ring-[rgba(208,187,149,0.3)] transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}
            />
          </div>
        </div>

        {/* Email Address */}
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

        {/* Phone Number */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-[#364153] text-[13px] font-normal"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Phone className="w-5 h-5 text-[#9ca3af]" />
            </div>
            <input
              type="tel"
              placeholder="+84 0355999999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-[#364153] text-[13px] font-normal"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Lock className="w-5 h-5 text-[#9ca3af]" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-[50px] pl-[48px] pr-[48px] border border-[#d1d5dc] rounded-[14px] text-[15px] text-[#0a0a0a] placeholder-[rgba(10,10,10,0.4)] outline-none focus:border-[#d0bb95] focus:ring-1 focus:ring-[rgba(208,187,149,0.3)] transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#5c6b5e] transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Create Account Button */}
        <button
          type="submit"
          className="w-full h-12 bg-[#d0bb95] text-white text-[15px] font-normal rounded-[14px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] hover:bg-[#c2a571] transition-colors mt-3"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Create Account
        </button>
      </form>

      {/* Divider */}
      <div className="w-full flex items-center gap-4 my-5">
        <div className="flex-1 h-px bg-[#d1d5dc]" />
        <span
          className="text-[#6a7282] text-[13px]"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Or sign up with
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

      {/* Sign In Link */}
      <p
        className="mt-6 text-[#4a5565] text-[15px]"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        Already have an account?{" "}
        <Link
          href="/signin"
          className="text-[#364153] text-[20px] font-medium hover:text-[#d0bb95] transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function SignUpPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="w-[448px]">
          <SignUpForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
