"use client";

import Link from "next/link";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import {
  ProfileNotificationsPreference,
  ProfileNotificationsSection,
  ProfileRewardsCard,
  ProfileSettingsNavItem,
} from "@/lib/profile/types";
import { useAuth, useLocale } from "@/src/contexts";
import { ProfileNotificationsSettingsForm } from "./ProfileNotificationsSettingsForm";
import { ProfileSettingsSidebar } from "./ProfileSettingsSidebar";

export function ProfileNotificationsSettingsPageContent() {
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
      active: true,
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

  const emailPreferences: ProfileNotificationsPreference[] = [
    {
      id: "order_updates",
      label: t("profile.notifications.orderUpdates"),
      description: t("profile.notifications.orderUpdatesDesc"),
      enabled: true,
    },
    {
      id: "seasonal_curations",
      label: t("profile.notifications.specialOffers"),
      description: t("profile.notifications.specialOffersDesc"),
      enabled: true,
    },
    {
      id: "boutique_news",
      label: t("profile.notifications.newsletter"),
      description: t("profile.notifications.newsletterDesc"),
      enabled: false,
    },
    {
      id: "event_reminders_email",
      label: t("profile.notifications.eventReminders"),
      description: t("profile.notifications.eventRemindersEmailDesc"),
      enabled: false,
    },
  ];

  const smsPreferences: ProfileNotificationsPreference[] = [
    {
      id: "delivery_alerts",
      label: t("profile.notifications.deliveryAlerts"),
      description: t("profile.notifications.deliveryAlertsDesc"),
      enabled: false,
    },
    {
      id: "event_reminders_sms",
      label: t("profile.notifications.eventReminders"),
      description: t("profile.notifications.eventRemindersSmsDesc"),
      enabled: false,
    },
  ];

  const emailSection: ProfileNotificationsSection = {
    title: t("profile.notifications.emailSectionTitle"),
    subtitle: t("profile.notifications.emailSectionSubtitle"),
    preferences: emailPreferences,
  };

  const smsSection: ProfileNotificationsSection = {
    title: t("profile.notifications.smsSectionTitle"),
    subtitle: t("profile.notifications.smsSectionSubtitle"),
    preferences: smsPreferences,
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
                {t("profile.notifications.title")}
              </h1>
              <p className="mt-3 text-[14px] leading-6 text-[#5c6b5e]">
                {t("profile.notifications.subtitle")}
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
                  {t("profile.notifications.signInTitle")}
                </h2>
                <p className="mx-auto mt-3 max-w-[560px] text-[14px] leading-6 text-[#5c6b5e]">
                  {t("profile.notifications.signInSubtitle")}
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
                <ProfileNotificationsSettingsForm
                  emailSection={emailSection}
                  smsSection={smsSection}
                  discardLabel={t("profile.notifications.discard")}
                  updateLabel={t("profile.notifications.update")}
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
