"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { Suspense, useState } from "react";
import { ArrowLeft, Flower2, KeyRound, Lock, Mail } from "lucide-react";
import { Footer, Navbar } from "@/components/layout";
import { authApi } from "@/lib/auth/client";
import {
  getPasswordValidationMessage,
  getPasswordRequirementsMessage,
} from "@/lib/auth/validation";
import { useLocale } from "@/src/contexts";

function ForgotPasswordFormContent() {
  const router = useRouter();
  const { locale } = useLocale();
  const [step, setStep] = useState<"request" | "verify" | "success">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const copy =
    locale === "vi"
      ? {
          emailRequired: "Vui lòng nhập địa chỉ email.",
          emailNotFound: "Email này không tồn tại.",
          debugNoticePrefix: "Đang chạy chế độ debug local. Dùng mã xác minh",
          debugNoticeSuffix: "để tiếp tục.",
          verificationSent: "Mã xác minh đã được gửi. Vui lòng kiểm tra hộp thư email.",
          sendCodeFailed: "Hiện không thể gửi mã xác minh.",
          codeRequired: "Vui lòng nhập mã 6 chữ số từ email.",
          passwordMismatch: "Mật khẩu xác nhận không khớp.",
          resetFailed: "Hiện không thể đặt lại mật khẩu.",
          successTitle: "Cập nhật mật khẩu thành công",
          successDescriptionPrefix: "Mật khẩu đã được đặt lại thành công cho",
          successDescriptionSuffix: "Bạn có thể đăng nhập bằng mật khẩu mới.",
          backToSignIn: "Quay lại đăng nhập",
          signInSuccessMessage: "Đặt lại mật khẩu thành công",
          requestTitle: "Quên mật khẩu",
          verifyTitle: "Nhập mã từ Gmail",
          requestDescription:
            "Nhập email của bạn, chúng tôi sẽ gửi mã xác minh 6 chữ số đến Gmail.",
          verifyDescription:
            "Kiểm tra Gmail, nhập mã 6 chữ số rồi đặt mật khẩu mới.",
          emailLabel: "Địa chỉ email",
          sendButton: "Gửi mã xác minh",
          sending: "Đang gửi...",
          codeLabel: "Mã xác minh",
          newPasswordLabel: "Mật khẩu mới",
          newPasswordPlaceholder: "Nhập mật khẩu mới",
          confirmPasswordLabel: "Xác nhận mật khẩu",
          confirmPasswordPlaceholder: "Nhập lại mật khẩu mới",
          resetButton: "Đặt lại mật khẩu",
          updating: "Đang cập nhật...",
          resend: "Gửi lại mã",
          backToLogin: "Quay lại đăng nhập",
          botanicalAtelier: "Xưởng hoa thực vật",
          loading: "Đang tải...",
          gmailNotice:
            "Để gửi mã qua Gmail, backend SMTP cần cấu hình Gmail App Password hợp lệ.",
        }
      : {
          emailRequired: "Please enter your email address.",
          emailNotFound: "Email này không tồn tại.",
          debugNoticePrefix: "Local debug mode is active. Use verification code",
          debugNoticeSuffix: "to continue.",
          verificationSent: "Verification code sent. Please check your email inbox.",
          sendCodeFailed: "Unable to send verification code right now.",
          codeRequired: "Please enter the 6-digit code from your email.",
          passwordMismatch: "Passwords do not match.",
          resetFailed: "Unable to reset password right now.",
          successTitle: "Password updated",
          successDescriptionPrefix: "Your password has been reset successfully for",
          successDescriptionSuffix: "You can now sign in with your new password.",
          backToSignIn: "Back to Sign In",
          signInSuccessMessage: "Password reset successfully",
          requestTitle: "Forgot Password",
          verifyTitle: "Enter Gmail Code",
          requestDescription:
            "Enter your email address and we will send a 6-digit verification code to Gmail.",
          verifyDescription:
            "Check your Gmail inbox, enter the 6-digit code, then choose your new password.",
          emailLabel: "Email Address",
          sendButton: "Send Verification Code",
          sending: "Sending...",
          codeLabel: "Verification Code",
          newPasswordLabel: "New Password",
          newPasswordPlaceholder: "Enter new password",
          confirmPasswordLabel: "Confirm Password",
          confirmPasswordPlaceholder: "Confirm new password",
          resetButton: "Reset Password",
          updating: "Updating...",
          resend: "Send code again",
          backToLogin: "Back to Login",
          botanicalAtelier: "The Botanical Atelier",
          loading: "Loading...",
          gmailNotice:
            "Gmail delivery needs a valid Gmail App Password in backend SMTP configuration before codes can be sent.",
        };

  const newPasswordValidationMessage = newPassword
    ? getPasswordValidationMessage(newPassword, locale)
    : null;

  const handleRequestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    const preferLocalizedNotice = locale === "vi";

    if (!email.trim()) {
      setError(copy.emailRequired);
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.requestForgotPasswordCode({ email });

      if (response.deliveryMethod === "none") {
        setCode("");
        setNotice(preferLocalizedNotice ? copy.emailNotFound : response.message || copy.emailNotFound);
        setStep("request");
        return;
      }

      if (response.debugCode) {
        setCode(response.debugCode);
        setNotice(`${copy.debugNoticePrefix} ${response.debugCode} ${copy.debugNoticeSuffix}`);
      } else {
        setNotice(preferLocalizedNotice ? copy.verificationSent : response.message || copy.verificationSent);
      }
      setStep("verify");
    } catch (requestError) {
      const nextError = requestError as {
        response?: { data?: { message?: string; errors?: Array<{ defaultMessage?: string }> } };
        message?: string;
      };
      setError(
        nextError.response?.data?.errors?.[0]?.defaultMessage ||
          nextError.response?.data?.message ||
          nextError.message ||
          copy.sendCodeFailed
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!code.trim()) {
      setError(copy.codeRequired);
      return;
    }

    const passwordError = getPasswordValidationMessage(newPassword, locale);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(copy.passwordMismatch);
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
        response?: { data?: { message?: string; errors?: Array<{ defaultMessage?: string }> } };
        message?: string;
      };
      setError(
        nextError.response?.data?.errors?.[0]?.defaultMessage ||
          nextError.response?.data?.message ||
          nextError.message ||
          copy.resetFailed
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
            {copy.successTitle}
          </h2>
          <p
            className="text-center text-[14px] leading-[22.75px] text-[#4f4444]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {copy.successDescriptionPrefix} <span className="font-semibold">{email}</span>. {copy.successDescriptionSuffix}
          </p>
          <button
            onClick={() => router.push(`/signin?message=${encodeURIComponent(copy.signInSuccessMessage)}`)}
            className="mt-4 w-full rounded-full bg-gradient-to-b from-[#7d562d] to-[#7e572d] py-4 text-[16px] font-semibold text-white shadow-[0px_10px_15px_-3px_rgba(125,86,45,0.1),0px_4px_6px_-4px_rgba(125,86,45,0.1)] transition-opacity hover:opacity-90"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {copy.backToSignIn}
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
            {step === "request" ? copy.requestTitle : copy.verifyTitle}
          </h2>
          <p
            className="text-[14px] leading-[22.75px] text-[#4f4444]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {step === "request"
              ? copy.requestDescription
              : copy.verifyDescription}
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

        {notice ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            {notice}
          </div>
        ) : null}

        {step === "request" ? (
          <form onSubmit={handleRequestCode} className="mt-8 flex flex-col gap-6">
            <FieldLabel>{copy.emailLabel}</FieldLabel>
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
              {loading ? copy.sending : copy.sendButton}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="mt-8 flex flex-col gap-6">
            <div>
              <FieldLabel>{copy.codeLabel}</FieldLabel>
              <IconInput
                icon={<KeyRound className="h-4 w-4 text-[#817474]" />}
                type="text"
                placeholder="123456"
                value={code}
                onChange={(nextValue) => setCode(nextValue.replace(/\D/g, "").slice(0, 6))}
              />
            </div>

            <div>
              <FieldLabel>{copy.newPasswordLabel}</FieldLabel>
              <IconInput
                icon={<Lock className="h-4 w-4 text-[#817474]" />}
                type="password"
                placeholder={copy.newPasswordPlaceholder}
                value={newPassword}
                onChange={(nextValue) => setNewPassword(nextValue)}
              />
              <p className={`mt-2 text-[12px] ${newPasswordValidationMessage ? "text-red-600" : "text-[#6a7282]"}`}>
                {newPasswordValidationMessage || getPasswordRequirementsMessage(locale)}
              </p>
            </div>

            <div>
              <FieldLabel>{copy.confirmPasswordLabel}</FieldLabel>
              <IconInput
                icon={<Lock className="h-4 w-4 text-[#817474]" />}
                type="password"
                placeholder={copy.confirmPasswordPlaceholder}
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
              {loading ? copy.updating : copy.resetButton}
            </button>

            <button
              type="button"
              onClick={() => {
                setCode("");
                setNewPassword("");
                setConfirmPassword("");
                setError("");
                setNotice("");
                setStep("request");
              }}
              className="text-[13px] font-medium text-[#52634c] transition-opacity hover:opacity-70"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {copy.resend}
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
          {copy.backToLogin}
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
  const { locale } = useLocale();
  const botanicalAtelier = locale === "vi" ? "Xưởng hoa thực vật" : "The Botanical Atelier";

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
        {botanicalAtelier}
      </p>
    </div>
  );
}

function ForgotPasswordForm() {
  const { locale } = useLocale();
  const loadingText = locale === "vi" ? "Đang tải..." : "Loading...";

  return (
    <Suspense
      fallback={
        <div className="flex w-full flex-col items-center">
          <div className="text-[#4f4444] animate-pulse">{loadingText}</div>
        </div>
      }
    >
      <ForgotPasswordFormContent />
    </Suspense>
  );
}

export default function ForgotPasswordPage() {
  const { locale } = useLocale();
  const gmailNotice =
    locale === "vi"
      ? "Để gửi mã qua Gmail, backend SMTP cần cấu hình Gmail App Password hợp lệ."
      : "Gmail delivery needs a valid Gmail App Password in backend SMTP configuration before codes can be sent.";

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
          {gmailNotice}
        </p>
      </main>

      <Footer />
    </div>
  );
}
