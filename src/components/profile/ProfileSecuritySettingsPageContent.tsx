"use client";

import { useState } from "react";
import Link from "next/link";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import { authApi } from "@/lib/auth/client";
import {
  ProfileRewardsCard,
  ProfileSecurityPasswordField,
  ProfileSecurityToggleOption,
  ProfileSettingsNavItem,
} from "@/lib/profile/types";
import { useAuth } from "@/src/contexts";
import {
  ProfileSecuritySettingsForm,
  UpdatePasswordPayload,
} from "./ProfileSecuritySettingsForm";
import { ProfileSettingsSidebar } from "./ProfileSettingsSidebar";

const SETTINGS_NAVIGATION: ProfileSettingsNavItem[] = [
  {
    id: "account",
    label: "Account",
    icon: "account",
    active: false,
    href: "/profile/settings",
  },
  {
    id: "security",
    label: "Security",
    icon: "security",
    active: true,
    href: "/profile/settings/security",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "notifications",
    active: false,
    href: "/profile/settings/notifications",
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: "preferences",
    active: false,
    href: "/profile/settings/preferences",
  },
];

const REWARDS_CARD: ProfileRewardsCard = {
  title: "Bloom Rewards",
  description: "You have 450 points to spend on your next bouquet.",
  ctaLabel: "View Details",
};

const PASSWORD_FIELDS: ProfileSecurityPasswordField[] = [
  {
    id: "current-password",
    label: "Current Password",
    placeholder: "Enter current password",
  },
  {
    id: "new-password",
    label: "New Password",
    placeholder: "Min. 8 characters",
  },
  {
    id: "confirm-password",
    label: "Confirm New Password",
    placeholder: "Re-enter new password",
  },
];

const TWO_FACTOR_OPTIONS: ProfileSecurityToggleOption[] = [
  {
    id: "sms-2fa",
    label: "Enable 2FA via SMS",
    description: "Receive a security code on your phone when signing in.",
    enabled: false,
  },
];

const TWO_FACTOR_STORAGE_KEY = "profile_security_two_factor";

export function ProfileSecuritySettingsPageContent() {
  const { user, loading } = useAuth();
  const [twoFactorOptions, setTwoFactorOptions] = useState<ProfileSecurityToggleOption[]>(
    () => {
      if (typeof window === "undefined") {
        return TWO_FACTOR_OPTIONS;
      }

      try {
        const raw = window.localStorage.getItem(TWO_FACTOR_STORAGE_KEY);
        if (!raw) {
          return TWO_FACTOR_OPTIONS;
        }

        const parsed = JSON.parse(raw) as Array<{
          id: string;
          enabled: boolean;
        }>;

        return TWO_FACTOR_OPTIONS.map((option) => {
          const saved = parsed.find((item) => item.id === option.id);
          return saved ? { ...option, enabled: saved.enabled } : option;
        });
      } catch {
        return TWO_FACTOR_OPTIONS;
      }
    }
  );

  const handleUpdatePassword = async (payload: UpdatePasswordPayload) => {
    await authApi.changePassword({
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    });
  };

  const handleSaveTwoFactor = async (
    options: ProfileSecurityToggleOption[]
  ) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        TWO_FACTOR_STORAGE_KEY,
        JSON.stringify(options.map((option) => ({ id: option.id, enabled: option.enabled })))
      );
    }
    setTwoFactorOptions(options.map((option) => ({ ...option })));
  };

  return (
    <div className="min-h-screen bg-[#f7f3ed]">
      <Navbar />
      <main className="pb-24">
        <div className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-6 lg:px-10 lg:pt-24">
          <div className="mx-auto max-w-[1160px]">
            <header className="pb-12 lg:pb-16">
              <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-[#d0bb95]">
                Account
              </p>
              <h1
                className="mt-4 text-[44px] font-light leading-none text-[#2d2a26]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                Security Settings
              </h1>
              <p className="mt-3 text-[14px] leading-6 text-[#5c6b5e]">
                Manage your profile security and access preferences.
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
                  Sign in to manage security settings
                </h2>
                <p className="mx-auto mt-3 max-w-[560px] text-[14px] leading-6 text-[#5c6b5e]">
                  Security controls are available only for authenticated users.
                </p>
                <div className="mt-8">
                  <Link
                    href="/signin"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#d0bb95] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571]"
                  >
                    Go to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
                <ProfileSettingsSidebar
                  navigation={SETTINGS_NAVIGATION}
                  rewards={REWARDS_CARD}
                />
                <ProfileSecuritySettingsForm
                  passwordSectionTitle="Change Password"
                  passwordSectionSubtitle="Update your password to keep your account secure."
                  passwordFields={PASSWORD_FIELDS}
                  updatePasswordLabel="Update Password"
                  twoFactorTitle="Two-Factor Authentication"
                  twoFactorSubtitle="Add an extra layer of security to your account."
                  twoFactorOptions={twoFactorOptions}
                  cancelLabel="Cancel"
                  saveLabel="Save Changes"
                  onUpdatePassword={handleUpdatePassword}
                  onSaveTwoFactor={handleSaveTwoFactor}
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
