"use client";

import Link from "next/link";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import {
  ProfilePreferencesGiftingSection,
  ProfilePreferencesRegionalSection,
  ProfileRewardsCard,
  ProfileSettingsNavItem,
} from "@/lib/profile/types";
import { useAuth } from "@/src/contexts";
import { ProfilePreferencesSettingsForm } from "./ProfilePreferencesSettingsForm";
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
    active: false,
    href: "/profile/settings/notifications",
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: "preferences",
    active: true,
    href: "/profile/settings/preferences",
  },
];

const REWARDS_CARD: ProfileRewardsCard = {
  title: "Bloom Rewards",
  description: "You have 450 points to spend on your next bouquet.",
  ctaLabel: "View Details",
};

const REGIONAL_SECTION: ProfilePreferencesRegionalSection = {
  title: "Regional Preferences",
  fields: [
    {
      id: "language",
      label: "Language",
      description: "Preferred language for communication and interface.",
      value: "en",
      options: [
        { id: "en", value: "en", label: "English (EN)" },
        { id: "vi", value: "vi", label: "Tiếng Việt (VI)" },
      ],
    },
    {
      id: "currency",
      label: "Currency",
      description: "Prices will be displayed in this currency.",
      value: "usd",
      options: [
        { id: "usd", value: "usd", label: "USD ($)" },
        { id: "vnd", value: "vnd", label: "VND (₫)" },
      ],
    },
  ],
};

const GIFTING_SECTION: ProfilePreferencesGiftingSection = {
  title: "Gifting Preferences",
  toggles: [
    {
      id: "signature_wrap",
      label: "Signature Gift Wrap",
      description: "Always include our premium boutique wrapping.",
      enabled: true,
    },
    {
      id: "eco_delivery",
      label: "Eco-Friendly Delivery",
      description: "Minimize packaging where possible.",
      enabled: false,
    },
  ],
  preview: {
    image: "/images/gallery-photo.png",
    alt: "Curated floral gift presentation preview",
    label: "CURATED GIFT PRESENTATION",
  },
};

export function ProfilePreferencesSettingsPageContent() {
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
                Preferences Settings
              </h1>
              <p className="mt-3 text-[14px] leading-6 text-[#5c6b5e]">
                Customize your shopping experience to match your personal
                aesthetic.
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
                  Sign in to manage preferences
                </h2>
                <p className="mx-auto mt-3 max-w-[560px] text-[14px] leading-6 text-[#5c6b5e]">
                  Preference controls are available only for authenticated users.
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
                <ProfilePreferencesSettingsForm
                  regionalSection={REGIONAL_SECTION}
                  giftingSection={GIFTING_SECTION}
                  saveLabel="Save Changes"
                  resetLabel="Reset to Default"
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
