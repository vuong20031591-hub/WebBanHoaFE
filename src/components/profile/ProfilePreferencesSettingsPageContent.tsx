"use client";

import Link from "next/link";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import {
  ProfilePreferencesRegionalSection,
  ProfileRewardsCard,
  ProfileSettingsNavItem,
} from "@/lib/profile/types";
import { useAuth, useLocale } from "@/src/contexts";
import { ProfilePreferencesSettingsForm } from "./ProfilePreferencesSettingsForm";
import { ProfileSettingsSidebar } from "./ProfileSettingsSidebar";

export function ProfilePreferencesSettingsPageContent() {
  const { user, loading } = useAuth();
  const { t } = useLocale();

  const settingsNavigation: ProfileSettingsNavItem[] = [
    {
      id: "account",
      label: t("profile.nav.accountInfo"),
      icon: "account",
      active: false,
      href: "/profile/settings",
    },
    {
      id: "security",
      label: t("profile.nav.security"),
      icon: "security",
      active: false,
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
      active: true,
      href: "/profile/settings/preferences",
    },
  ];

  const rewardsCard: ProfileRewardsCard = {
    title: t("profile.rewards.title"),
    description: t("profile.rewards.description"),
    ctaLabel: t("profile.rewards.cta"),
  };

  const regionalSection: ProfilePreferencesRegionalSection = {
    title: t("profile.preferences.regionalTitle"),
    fields: [
      {
        id: "language",
        label: t("profile.preferences.languageLabel"),
        description: t("profile.preferences.languageDescription"),
        value: "en",
        options: [
          { id: "en", value: "en", label: "English (EN)" },
          { id: "vi", value: "vi", label: "Tiếng Việt (VI)" },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#f7f3ed]">
      <Navbar />
      <main className="pb-24">
        <div className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-6 lg:px-10 lg:pt-24">
          <div className="mx-auto max-w-[1160px]">
            <header className="pb-12 lg:pb-16">
              <h1
                className="text-[44px] font-light leading-none text-[#2d2a26]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                {t("profile.preferences.title")}
              </h1>
              <p className="mt-3 text-[14px] leading-6 text-[#5c6b5e]">
                {t("profile.preferences.subtitle")}
              </p>
            </header>

            {loading ? (
              <div className="h-[560px] animate-pulse rounded-[40px] bg-white/60" />
            ) : !user ? (
              <div className="rounded-[32px] bg-white/70 px-8 py-10 text-center">
                <h2
                  className="text-[32px] leading-[1.1] text-[#2d2a26]"
                  style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                  {t("profile.preferences.signInTitle")}
                </h2>
                <p className="mx-auto mt-3 max-w-[560px] text-[14px] leading-6 text-[#5c6b5e]">
                  {t("profile.preferences.signInSubtitle")}
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
                <ProfilePreferencesSettingsForm
                  regionalSection={regionalSection}
                  saveLabel={t("profile.preferences.save")}
                  resetLabel={t("profile.preferences.reset")}
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
