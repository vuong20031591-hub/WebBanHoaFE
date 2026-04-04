"use client";

import Link from "next/link";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import {
  ProfileNotificationsPreference,
  ProfileNotificationsSection,
  ProfileRewardsCard,
  ProfileSettingsNavItem,
} from "@/lib/profile/types";
import { useAuth } from "@/src/contexts";
import { ProfileNotificationsSettingsForm } from "./ProfileNotificationsSettingsForm";
import { ProfileSettingsSidebar } from "./ProfileSettingsSidebar";

const SETTINGS_NAVIGATION: ProfileSettingsNavItem[] = [
  {
    id: "account",
    label: "Account Info",
    icon: "account",
    active: false,
    href: "/profile/settings",
  },
  {
    id: "security",
    label: "Security",
    icon: "security",
    active: false,
    href: "/profile/settings/security",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "notifications",
    active: true,
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

const EMAIL_PREFERENCES: ProfileNotificationsPreference[] = [
  {
    id: "order_updates",
    label: "Order Updates",
    description:
      "Channel: Email. Detailed summaries, tracking links, and delivery confirmations for every arrangement.",
    enabled: true,
  },
  {
    id: "seasonal_curations",
    label: "Seasonal Curations",
    description:
      "Channel: Email. Our lead floral artist’s monthly picks and early access to limited holiday collections.",
    enabled: true,
  },
  {
    id: "boutique_news",
    label: "Boutique News",
    description:
      "Channel: Email. Occasional updates on workshop events, new flower varieties, and sustainability initiatives.",
    enabled: false,
  },
];

const SMS_PREFERENCES: ProfileNotificationsPreference[] = [
  {
    id: "delivery_alerts",
    label: "Delivery Alerts",
    description:
      "Channel: SMS. Instant notifications when your bouquet is out for delivery and has been safely received.",
    enabled: false,
  },
];

const EMAIL_SECTION: ProfileNotificationsSection = {
  title: "Email Notifications",
  subtitle: "Stay connected with our boutique via curated emails.",
  preferences: EMAIL_PREFERENCES,
};

const SMS_SECTION: ProfileNotificationsSection = {
  title: "SMS Notifications",
  subtitle: "Time-sensitive updates delivered to your phone number.",
  preferences: SMS_PREFERENCES,
};

export function ProfileNotificationsSettingsPageContent() {
  const { user, loading } = useAuth();

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
                Notifications Settings
              </h1>
              <p className="mt-3 text-[14px] leading-6 text-[#5c6b5e]">
                Tailor your boutique experience to your lifestyle.
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
                  Sign in to manage notifications
                </h2>
                <p className="mx-auto mt-3 max-w-[560px] text-[14px] leading-6 text-[#5c6b5e]">
                  Notification controls are available only for authenticated users.
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
                <ProfileNotificationsSettingsForm
                  emailSection={EMAIL_SECTION}
                  smsSection={SMS_SECTION}
                  discardLabel="Discard Changes"
                  updateLabel="Update Preferences"
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
