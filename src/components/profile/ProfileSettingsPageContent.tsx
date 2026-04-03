"use client";

import Link from "next/link";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import { authApi } from "@/lib/auth/client";
import {
  ProfileCommunicationPreference,
  ProfileSettingsNavItem,
  ProfileRewardsCard,
} from "@/lib/profile/types";
import { useAuth } from "@/src/contexts";
import {
  ProfileSettingsForm,
  SaveProfileSettingsPayload,
} from "./ProfileSettingsForm";
import { ProfileSettingsSidebar } from "./ProfileSettingsSidebar";

const SETTINGS_NAVIGATION: ProfileSettingsNavItem[] = [
  {
    id: "account",
    label: "Account",
    icon: "account",
    active: true,
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
    active: false,
    href: "/profile/settings/preferences",
  },
];

const REWARDS_CARD: ProfileRewardsCard = {
  title: "Loyalty Rewards",
  description: "Earn points from every order and unlock seasonal florist perks.",
  ctaLabel: "View Benefits",
};

const COMMUNICATION_PREFERENCES: ProfileCommunicationPreference[] = [
  {
    id: "order_updates",
    label: "Order updates",
    description: "Receive order confirmation and delivery updates by email.",
    enabled: true,
  },
  {
    id: "special_offers",
    label: "Special offers",
    description: "Get seasonal promotions and exclusive bouquet launches.",
    enabled: true,
  },
  {
    id: "reminders",
    label: "Event reminders",
    description: "Get reminder emails for saved dates and occasions.",
    enabled: false,
  },
];

export function ProfileSettingsPageContent() {
  const { user, loading, refreshUser } = useAuth();

  const accountInfo = {
    photo: "/images/hero-main.png",
    changePhotoLabel: "Photo update coming soon",
    fullName: user?.fullName?.trim() || "Flower Member",
    email: user?.email?.trim() || "No email found",
    phone: user?.phone?.trim() || "Not provided yet",
    address: "Address profile will sync here once backend profile API is enabled.",
  };

  const handleSaveSettings = async (payload: SaveProfileSettingsPayload) => {
    await authApi.updateProfile({
      fullName: payload.fullName,
      phone: payload.phone,
    });
    await refreshUser();
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
                Account Settings
              </h1>
              <p className="mt-3 text-[14px] leading-6 text-[#5c6b5e]">
                You can review your current account information here.
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
                  Sign in to manage your settings
                </h2>
                <p className="mx-auto mt-3 max-w-[560px] text-[14px] leading-6 text-[#5c6b5e]">
                  Settings are available only for authenticated users.
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
                <ProfileSettingsForm
                  accountInfo={accountInfo}
                  communicationTitle="Communication Preferences"
                  communicationSubtitle="Choose the updates you want to receive."
                  communicationPreferences={COMMUNICATION_PREFERENCES}
                  cancelLabel="Cancel"
                  saveLabel="Save Changes"
                  onSave={handleSaveSettings}
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
