"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import { authApi } from "@/lib/auth/client";
import {
  getUserPreferences,
  requestSmsTwoFactorCode,
  updateUserPreferences,
  verifySmsTwoFactorCode,
} from "@/lib/api";
import {
  ProfileRewardsCard,
  ProfileSecurityPasswordField,
  ProfileSecurityToggleOption,
  ProfileSettingsNavItem,
} from "@/lib/profile/types";
import { useAuth, useLocale } from "@/src/contexts";
import {
  ProfileSecuritySettingsForm,
  UpdatePasswordPayload,
} from "./ProfileSecuritySettingsForm";
import { ProfileSettingsSidebar } from "./ProfileSettingsSidebar";

function maskPhoneNumber(phone?: string | null) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  if (digits.length <= 4) {
    return digits;
  }

  return `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

function buildTwoFactorOptions(
  phone: string | null | undefined,
  enabled: boolean,
  copy: {
    label: string;
    descriptionPrefix: string;
    descriptionSuffix: string;
    descriptionNoPhone: string;
  }
): ProfileSecurityToggleOption[] {
  const hasSavedPhone = Boolean(phone?.trim());
  const maskedPhone = maskPhoneNumber(phone);

  return [
    {
      id: "sms-2fa",
      label: copy.label,
      description: hasSavedPhone
        ? `${copy.descriptionPrefix} ${maskedPhone} ${copy.descriptionSuffix}`
        : copy.descriptionNoPhone,
      enabled: hasSavedPhone ? enabled : false,
      disabled: !hasSavedPhone,
    },
  ];
}

export function ProfileSecuritySettingsPageContent() {
  const { user, loading, refreshUser } = useAuth();
  const { t } = useLocale();
  const [smsTwoFactorEnabled, setSmsTwoFactorEnabled] = useState(false);
  const [twoFactorPendingEnable, setTwoFactorPendingEnable] = useState(false);
  const [twoFactorVerificationPending, setTwoFactorVerificationPending] =
    useState(false);
  const [twoFactorVerificationHint, setTwoFactorVerificationHint] = useState("");
  const requestedProfileRefreshRef = useRef(false);

  const savedPhone = user?.phone?.trim() ?? "";

  const passwordFields: ProfileSecurityPasswordField[] = [
    {
      id: "current-password",
      label: t("profile.security.passwordField.currentLabel"),
      placeholder: t("profile.security.passwordField.currentPlaceholder"),
    },
    {
      id: "new-password",
      label: t("profile.security.passwordField.newLabel"),
      placeholder: t("profile.security.passwordField.newPlaceholder"),
    },
    {
      id: "confirm-password",
      label: t("profile.security.passwordField.confirmLabel"),
      placeholder: t("profile.security.passwordField.confirmPlaceholder"),
    },
  ];

  const settingsNavigation: ProfileSettingsNavItem[] = [
    {
      id: "account",
      label: t("profile.nav.account"),
      icon: "account",
      active: false,
      href: "/profile/settings",
    },
    {
      id: "security",
      label: t("profile.nav.security"),
      icon: "security",
      active: true,
      href: "/profile/settings/security",
    },
    {
      id: "notifications",
      label: t("profile.nav.notifications"),
      icon: "notifications",
      active: false,
      href: "/profile/settings/notifications",
    },
    {
      id: "preferences",
      label: t("profile.nav.preferences"),
      icon: "preferences",
      active: false,
      href: "/profile/settings/preferences",
    },
  ];

  const rewardsCard: ProfileRewardsCard = {
    title: t("profile.rewards.title"),
    description: t("profile.rewards.description"),
    ctaLabel: t("profile.rewards.cta"),
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;
    void (async () => {
      setTwoFactorPendingEnable(false);
      setTwoFactorVerificationPending(false);
      setTwoFactorVerificationHint("");

      try {
        const prefs = await getUserPreferences();
        if (cancelled) {
          return;
        }

        setSmsTwoFactorEnabled(Boolean(prefs.smsTwoFactorEnabled));
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load 2FA preferences:", error);
          setSmsTwoFactorEnabled(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (loading || !user || savedPhone || requestedProfileRefreshRef.current) {
      return;
    }

    requestedProfileRefreshRef.current = true;
    void refreshUser().finally(() => {
      requestedProfileRefreshRef.current = false;
    });
  }, [loading, refreshUser, savedPhone, user]);

  const handleUpdatePassword = async (payload: UpdatePasswordPayload) => {
    await authApi.changePassword({
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    });
  };

  const handleSaveTwoFactor = async (
    options: ProfileSecurityToggleOption[]
  ) => {
    const smsOption = options.find((option) => option.id === "sms-2fa");
    if (!smsOption) {
      return;
    }

    if (smsOption.enabled) {
      if (!savedPhone) {
        return t("profile.security.message.addPhoneBeforeEnable");
      }

      if (smsTwoFactorEnabled) {
        return t("profile.security.message.alreadyEnabled");
      }

      const response = await requestSmsTwoFactorCode();
      setTwoFactorPendingEnable(true);
      setTwoFactorVerificationPending(true);
      setTwoFactorVerificationHint(
        response.maskedPhone
          ? `${response.message} ${t("profile.security.message.sentTo")} ${response.maskedPhone}.`
          : response.message
      );
      return t("profile.security.message.verificationCodeSent");
    }

    await updateUserPreferences({ smsTwoFactorEnabled: false });
    setSmsTwoFactorEnabled(false);
    setTwoFactorPendingEnable(false);
    setTwoFactorVerificationPending(false);
    setTwoFactorVerificationHint("");
    return t("profile.security.message.disabled");
  };

  const handleVerifyTwoFactorCode = async (code: string) => {
    const prefs = await verifySmsTwoFactorCode({ code });
    setSmsTwoFactorEnabled(Boolean(prefs.smsTwoFactorEnabled));
    setTwoFactorPendingEnable(false);
    setTwoFactorVerificationPending(false);
    setTwoFactorVerificationHint("");
    return t("profile.security.message.enabled");
  };

  return (
    <div className="min-h-screen bg-[#f7f3ed]">
      <Navbar />
      <main className="pb-24">
        <div className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-6 lg:px-10 lg:pt-24">
          <div className="mx-auto max-w-[1160px]">
            <header className="pb-12 lg:pb-16">
              <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-[#d0bb95]">
                {t("profile.settings.accountBadge")}
              </p>
              <h1
                className="mt-4 text-[44px] font-light leading-none text-[#2d2a26]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                {t("profile.security.title")}
              </h1>
              <p className="mt-3 text-[14px] leading-6 text-[#5c6b5e]">
                {t("profile.security.subtitle")}
              </p>
            </header>

            {loading ? (
              <div className="h-[560px] rounded-[40px] bg-white/60 animate-pulse" />
            ) : !user ? (
              <div className="rounded-[32px] bg-white/70 px-8 py-10 text-center">
                <h2
                  className="text-[32px] leading-[1.1] text-[#2d2a26]"
                  style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                  {t("profile.security.signInTitle")}
                </h2>
                <p className="mx-auto mt-3 max-w-[560px] text-[14px] leading-6 text-[#5c6b5e]">
                  {t("profile.security.signInSubtitle")}
                </p>
                <div className="mt-8">
                  <Link
                    href="/signin"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#d0bb95] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571]"
                  >
                    {t("profile.common.goToSignIn")}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
                <ProfileSettingsSidebar
                  navigation={settingsNavigation}
                  rewards={rewardsCard}
                />
                <ProfileSecuritySettingsForm
                  passwordSectionTitle={t("profile.security.changePassword")}
                  passwordSectionSubtitle={t("profile.security.changePasswordSubtitle")}
                  passwordFields={passwordFields}
                  updatePasswordLabel={t("profile.security.updatePassword")}
                  twoFactorTitle={t("profile.security.twoFactorTitle")}
                  twoFactorSubtitle={savedPhone
                    ? t("profile.security.twoFactorSubtitleWithPhone")
                    : t("profile.security.twoFactorSubtitleNoPhone")}
                  twoFactorOptions={buildTwoFactorOptions(
                    savedPhone,
                    smsTwoFactorEnabled || twoFactorPendingEnable,
                    {
                      label: t("profile.security.twoFactor.smsLabel"),
                      descriptionPrefix: t("profile.security.twoFactor.smsDescWithPhonePrefix"),
                      descriptionSuffix: t("profile.security.twoFactor.smsDescWithPhoneSuffix"),
                      descriptionNoPhone: t("profile.security.twoFactor.smsDescNoPhone"),
                    }
                  )}
                  cancelLabel={t("profile.settings.cancel")}
                  saveLabel={t("profile.settings.saveChanges")}
                  onUpdatePassword={handleUpdatePassword}
                  onSaveTwoFactor={handleSaveTwoFactor}
                  twoFactorVerificationPending={twoFactorVerificationPending}
                  twoFactorVerificationHint={twoFactorVerificationHint}
                  onVerifyTwoFactorCode={handleVerifyTwoFactorCode}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <ChatLive />
    </div>
  );
}
