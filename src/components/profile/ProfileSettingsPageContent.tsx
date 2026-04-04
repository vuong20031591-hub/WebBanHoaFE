"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import { authApi } from "@/lib/auth/client";
import { getUserAddresses, getNotificationPreferences, updateNotificationPreferences } from "@/lib/api";
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
  title: "Bloom Rewards",
  description: "You have 450 points to spend on your next bouquet.",
  ctaLabel: "View Details",
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
  const [primaryAddress, setPrimaryAddress] = useState<string>("");
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [communicationPreferences, setCommunicationPreferences] = useState(COMMUNICATION_PREFERENCES);
  const [loadingPreferences, setLoadingPreferences] = useState(true);

  useEffect(() => {
    if (user) {
      loadPrimaryAddress();
      loadNotificationPreferences();
    }
  }, [user]);

  const loadNotificationPreferences = async () => {
    try {
      setLoadingPreferences(true);
      const prefs = await getNotificationPreferences();
      console.log("Loaded notification preferences from backend:", prefs);
      setCommunicationPreferences([
        {
          id: "order_updates",
          label: "Order updates",
          description: "Receive order confirmation and delivery updates by email.",
          enabled: prefs.emailOrderUpdates,
        },
        {
          id: "special_offers",
          label: "Special offers",
          description: "Get seasonal promotions and exclusive bouquet launches.",
          enabled: prefs.emailPromotions,
        },
        {
          id: "reminders",
          label: "Event reminders",
          description: "Get reminder emails for saved dates and occasions.",
          enabled: prefs.emailNewsletter,
        },
      ]);
      console.log("Communication preferences set:", [prefs.emailOrderUpdates, prefs.emailPromotions, prefs.emailNewsletter]);
    } catch (err) {
      console.error("Failed to load notification preferences:", err);
    } finally {
      setLoadingPreferences(false);
    }
  };

  const loadPrimaryAddress = async () => {
    try {
      setLoadingAddress(true);
      const addresses = await getUserAddresses();
      const primary = addresses.find((addr) => addr.isDefault);
      
      if (primary) {
        const parts = [
          primary.address,
          primary.ward,
          primary.district,
          primary.city,
        ].filter(Boolean);
        setPrimaryAddress(parts.join(", "));
      } else if (addresses.length > 0) {
        const first = addresses[0];
        const parts = [
          first.address,
          first.ward,
          first.district,
          first.city,
        ].filter(Boolean);
        setPrimaryAddress(parts.join(", "));
      } else {
        setPrimaryAddress("No address found. Add one in Address Book.");
      }
    } catch (err) {
      console.error("Failed to load address:", err);
      setPrimaryAddress("Unable to load address.");
    } finally {
      setLoadingAddress(false);
    }
  };

  const accountInfo = {
    photo: "/images/hero-main.png",
    changePhotoLabel: "Photo update coming soon",
    fullName: user?.fullName?.trim() || "Flower Member",
    email: user?.email?.trim() || "No email found",
    phone: user?.phone?.trim() || "",
    address: loadingAddress ? "Loading address..." : primaryAddress,
  };

  const handleSaveSettings = async (payload: SaveProfileSettingsPayload) => {
    try {
      // Update user profile (fullName, phone)
      await authApi.updateProfile({
        fullName: payload.fullName,
        phone: payload.phone,
      });
      console.log("Profile updated:", payload.fullName, payload.phone);

      // Update notification preferences
      const orderUpdates = payload.communicationPreferences.find(p => p.id === "order_updates");
      const specialOffers = payload.communicationPreferences.find(p => p.id === "special_offers");
      const reminders = payload.communicationPreferences.find(p => p.id === "reminders");

      const prefsPayload = {
        emailOrderUpdates: orderUpdates?.enabled ?? true,
        emailPromotions: specialOffers?.enabled ?? true,
        emailNewsletter: reminders?.enabled ?? false,
      };
      console.log("Saving notification preferences:", prefsPayload);

      await updateNotificationPreferences(prefsPayload);
      console.log("Notification preferences updated");

      // Update or create address
      if (payload.address && payload.address.trim()) {
        try {
          const addresses = await getUserAddresses();
          const primary = addresses.find((addr) => addr.isDefault);

          // Parse address: "street, ward, district, city" or just "full address"
          const addressParts = payload.address.split(",").map((s) => s.trim()).filter(Boolean);
          
          let addressData;
          if (addressParts.length >= 4) {
            // Full format: street, ward, district, city
            addressData = {
              fullName: payload.fullName,
              phone: payload.phone,
              address: addressParts[0],
              ward: addressParts[1],
              district: addressParts[2],
              city: addressParts.slice(3).join(", "),
              isDefault: true,
            };
          } else if (addressParts.length === 3) {
            // Format: street, district, city
            addressData = {
              fullName: payload.fullName,
              phone: payload.phone,
              address: addressParts[0],
              ward: "",
              district: addressParts[1],
              city: addressParts[2],
              isDefault: true,
            };
          } else if (addressParts.length === 2) {
            // Format: street, city
            addressData = {
              fullName: payload.fullName,
              phone: payload.phone,
              address: addressParts[0],
              ward: "",
              district: "",
              city: addressParts[1],
              isDefault: true,
            };
          } else {
            // Single line address
            addressData = {
              fullName: payload.fullName,
              phone: payload.phone,
              address: payload.address.trim(),
              ward: "",
              district: "",
              city: "",
              isDefault: true,
            };
          }

          if (primary) {
            const { updateAddress } = await import("@/lib/api");
            await updateAddress(primary.id, addressData);
            console.log("Address updated:", primary.id, addressData);
          } else {
            const { createAddress } = await import("@/lib/api");
            await createAddress(addressData);
            console.log("Address created:", addressData);
          }
        } catch (err) {
          console.error("Failed to save address:", err);
          throw err;
        }
      }

      // Refresh user data from backend
      await refreshUser();
      console.log("User refreshed");

      // Reload address and preferences from backend
      await loadPrimaryAddress();
      await loadNotificationPreferences();
      console.log("Data reloaded");
    } catch (err) {
      console.error("Save failed:", err);
      throw err;
    }
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

            {loading || loadingAddress || loadingPreferences ? (
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
                  key={`${user.id}-${user.phone}-${primaryAddress}`}
                  accountInfo={accountInfo}
                  communicationTitle="Communication Preferences"
                  communicationSubtitle="Choose the updates you want to receive."
                  communicationPreferences={communicationPreferences}
                  cancelLabel="Cancel"
                  saveLabel="Save Changes"
                  manageAddressesHref="/profile/addresses"
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
