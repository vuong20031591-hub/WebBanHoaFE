"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { Suspense, useState } from "react";
import { ArrowLeft, Flower2, KeyRound, Lock, Mail } from "lucide-react";
import { Footer, Navbar } from "@/components/layout";
import { authApi } from "@/lib/auth/client";

function ForgotPasswordFormContent() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify" | "success">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await authApi.requestForgotPasswordCode({ email });
      setStep("verify");
    } catch (requestError) {
      const nextError = requestError as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        nextError.response?.data?.message ||
          nextError.message ||
          "Unable to send verification code right now."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Please enter the 6-digit code from your email.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPasswordWithCode({
        email,
        code,
        newPassword,
      });
      setStep("success");
    } catch (requestError) {
      const nextError = requestError as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        nextError.response?.data?.message ||
          nextError.message ||
          "Unable to reset password right now."
      );
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="flex w-full flex-col items-center text-center">
        <BrandHeader />
        <div className="flex w-full flex-col items-center gap-4 rounded-[16px] bg-white px-10 py-10 shadow-[0px_20px_40px_0px_rgba(27,28,26,0.04)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f3ef]">
            <KeyRound className="h-7 w-7 text-[#7d562d]" />
          </div>
          <h2
            className="text-[24px] font-normal leading-[32px] text-[#1b1c1a]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            Password updated
          </h2>
          <p
            className="text-center text-[14px] leading-[22.75px] text-[#4f4444]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Your password has been reset successfully for <span className="font-semibold">{email}</span>.
            You can now sign in with your new password.
          </p>
          <button
            onClick={() => router.push("/signin?message=Password reset successfully")}
            className="mt-4 w-full rounded-full bg-gradient-to-b from-[#7d562d] to-[#7e572d] py-4 text-[16px] font-semibold text-white shadow-[0px_10px_15px_-3px_rgba(125,86,45,0.1),0px_4px_6px_-4px_rgba(125,86,45,0.1)] transition-opacity hover:opacity-90"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center">
      <BrandHeader />

      <div className="w-full rounded-[16px] bg-white px-10 pb-12 pt-10 shadow-[0px_20px_40px_0px_rgba(27,28,26,0.04)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2
            className="text-[24px] font-normal leading-[32px] text-[#1b1c1a]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            {step === "request" ? "Forgot Password" : "Enter Gmail Code"}
          </h2>
          <p
            className="text-[14px] leading-[22.75px] text-[#4f4444]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {step === "request"
              ? "Enter your email address and we will send a 6-digit verification code to Gmail."
              : "Check your Gmail inbox, enter the 6-digit code, then choose your new password."}
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <div
            className={`h-2 w-16 rounded-full ${step === "request" ? "bg-[#7d562d]" : "bg-[#d8cec4]"}`}
          />
          <div
            className={`h-2 w-16 rounded-full ${step === "verify" ? "bg-[#7d562d]" : "bg-[#d8cec4]"}`}
          />
        </div>

        {error ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {step === "request" ? (
          <form onSubmit={handleRequestCode} className="mt-8 flex flex-col gap-6">
            <FieldLabel>Email Address</FieldLabel>
            <IconInput
              icon={<Mail className="h-4 w-4 text-[#817474]" />}
              type="email"
              placeholder="flower@atelier.com"
              value={email}
              onChange={(nextValue) => setEmail(nextValue)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-b from-[#7d562d] to-[#7e572d] py-4 text-[16px] font-semibold text-white shadow-[0px_10px_15px_-3px_rgba(125,86,45,0.1),0px_4px_6px_-4px_rgba(125,86,45,0.1)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="mt-8 flex flex-col gap-6">
            <div>
              <FieldLabel>Verification Code</FieldLabel>
              <IconInput
                icon={<KeyRound className="h-4 w-4 text-[#817474]" />}
                type="text"
                placeholder="123456"
                value={code}
                onChange={(nextValue) => setCode(nextValue.replace(/\D/g, "").slice(0, 6))}
              />
            </div>

            <div>
              <FieldLabel>New Password</FieldLabel>
              <IconInput
                icon={<Lock className="h-4 w-4 text-[#817474]" />}
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(nextValue) => setNewPassword(nextValue)}
              />
            </div>

            <div>
              <FieldLabel>Confirm Password</FieldLabel>
              <IconInput
                icon={<Lock className="h-4 w-4 text-[#817474]" />}
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(nextValue) => setConfirmPassword(nextValue)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-b from-[#7d562d] to-[#7e572d] py-4 text-[16px] font-semibold text-white shadow-[0px_10px_15px_-3px_rgba(125,86,45,0.1),0px_4px_6px_-4px_rgba(125,86,45,0.1)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setCode("");
                setNewPassword("");
                setConfirmPassword("");
                setError("");
                setStep("request");
              }}
              className="text-[13px] font-medium text-[#52634c] transition-opacity hover:opacity-70"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Send code again
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <Link
          href="/signin"
          className="flex items-center gap-2 text-[14px] font-medium text-[#52634c] transition-opacity hover:opacity-70"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.6px] text-[#4f4444]"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {children}
    </label>
  );
}

function IconInput({
  icon,
  type,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[12px] bg-[#f5f3ef] pl-11 pr-4 pb-[18px] pt-[17px] text-[14px] text-[#1b1c1a] outline-none transition-all placeholder:text-[rgba(129,116,116,0.6)] focus:ring-2 focus:ring-[rgba(125,86,45,0.2)]"
        style={{ fontFamily: "var(--font-inter)" }}
      />
    </div>
  );
}

function BrandHeader() {
  return (
    <div className="mb-12 flex flex-col items-center">
      <div className="relative mb-0 h-[184px] w-16">
        <div className="absolute left-1/2 top-0 flex h-full w-16 -translate-x-1/2 items-end justify-center rounded-t-full bg-[rgba(255,209,166,0.4)] pb-2">
          <Flower2 className="h-8 w-7 text-[#7d562d]" />
        </div>
      </div>
      <h1
        className="text-center text-[30px] font-bold leading-[36px] tracking-[-0.75px] text-[#1b1c1a]"
        style={{ fontFamily: "var(--font-noto-serif)" }}
      >
        Floral Boutique
      </h1>
      <p
        className="mt-1 text-center text-[14px] text-[rgba(79,68,68,0.8)]"
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
        <div className="flex w-full flex-col items-center">
          <div className="text-[#4f4444] animate-pulse">Loading...</div>
        </div>
      }
    >
      <ForgotPasswordFormContent />
    </Suspense>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbf9f5]">
      <Navbar />

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden opacity-20">
        <div className="absolute -left-40 -top-40 h-[759px] w-[759px] rounded-full bg-[#eae8e4]" />
        <div className="absolute bottom-0 right-0 h-[569px] w-[569px] rounded-full bg-[rgba(210,229,200,0.3)]" />
      </div>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[448px]">
          <ForgotPasswordForm />
        </div>

        <p
          className="mt-8 text-center text-[12px] tracking-[0.3px] text-[rgba(79,68,68,0.5)]"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Gmail delivery needs SMTP configured in backend before codes can be sent.
        </p>
      </main>

      <Footer />
    </div>
  );
}
