"use client";

import Link from "next/link";
import { useCallback, useState, useEffect } from "react";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import { authApi } from "@/lib/auth/client";
import { getUserAddresses } from "@/lib/api";
import {
  ProfileSettingsNavItem,
  ProfileRewardsCard,
} from "@/lib/profile/types";
import { useAuth, useLocale } from "@/src/contexts";
import {
  ProfileSettingsForm,
  SaveProfileSettingsPayload,
} from "./ProfileSettingsForm";
import { ProfileSettingsSidebar } from "./ProfileSettingsSidebar";

export function ProfileSettingsPageContent() {
  const { user, loading, refreshUser } = useAuth();
  const { t } = useLocale();
  const [primaryAddress, setPrimaryAddress] = useState<string>("");
  const [loadingAddress, setLoadingAddress] = useState(true);
  const fallbackAvatar = "/images/hero-main.png";

  const settingsNavigation: ProfileSettingsNavItem[] = [
    {
      id: "account",
      label: t("profile.nav.account"),
      icon: "account",
      active: true,
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
      active: false,
      href: "/profile/settings/preferences",
    },
  ];

  const rewardsCard: ProfileRewardsCard = {
    title: t("profile.rewards.title"),
    description: t("profile.rewards.description"),
    ctaLabel: t("profile.rewards.cta"),
  };

  const loadPrimaryAddress = useCallback(async () => {
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
        setPrimaryAddress(t("profile.settings.noAddressFound"));
      }
    } catch (err) {
      console.error("Failed to load address:", err);
      setPrimaryAddress(t("profile.settings.addressLoadError"));
    } finally {
      setLoadingAddress(false);
    }
  }, [t]);

  useEffect(() => {
    if (user) {
      void loadPrimaryAddress();
    }
  }, [loadPrimaryAddress, user]);

  const accountInfo = {
    photo: user?.avatarUrl?.trim() || fallbackAvatar,
    changePhotoLabel: t("profile.account.changePhoto"),
    fullName: user?.fullName?.trim() || t("profile.settings.fallbackName"),
    email: user?.email?.trim() || t("profile.settings.noEmailFound"),
    phone: user?.phone?.trim() || "",
    address: loadingAddress ? t("profile.settings.loadingAddress") : primaryAddress,
  };

  const handleUploadAvatar = async (file: File): Promise<string> => {
    const updatedUser = await authApi.uploadAvatar(file);
    await refreshUser();
    return updatedUser.avatarUrl?.trim() || accountInfo.photo;
  };

  const handleSaveSettings = async (payload: SaveProfileSettingsPayload) => {
    try {
      // Update user profile (fullName, phone)
      await authApi.updateProfile({
        fullName: payload.fullName,
        phone: payload.phone,
      });
      console.log("Profile updated:", payload.fullName, payload.phone);

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

      // Reload address from backend
      await loadPrimaryAddress();
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
                {t("profile.settings.accountBadge")}
              </p>
              <h1
                className="mt-4 text-[44px] font-light leading-none text-[#2d2a26]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                {t("profile.settings.title")}
              </h1>
              <p className="mt-3 text-[14px] leading-6 text-[#5c6b5e]">
                {t("profile.settings.subtitle")}
              </p>
            </header>

            {loading || loadingAddress ? (
              <div className="h-[560px] rounded-[40px] bg-white/60 animate-pulse" />
            ) : !user ? (
              <div className="rounded-[32px] bg-white/70 px-8 py-10 text-center">
                <h2
                  className="text-[32px] leading-[1.1] text-[#2d2a26]"
                  style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                  {t("profile.settings.signInTitle")}
                </h2>
                <p className="mx-auto mt-3 max-w-[560px] text-[14px] leading-6 text-[#5c6b5e]">
                  {t("profile.settings.signInSubtitle")}
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
                <ProfileSettingsForm
                  key={`${user.id}-${user.phone}-${primaryAddress}-${user.avatarUrl ?? ""}`}
                  accountInfo={accountInfo}
                  communicationTitle={t("profile.settings.notificationsTitle")}
                  communicationSubtitle={t("profile.settings.notificationsSubtitle")}
                  communicationPreferences={[]}
                  cancelLabel={t("profile.settings.cancel")}
                  saveLabel={t("profile.settings.saveChanges")}
                  manageNotificationsHref="/profile/settings/notifications"
                  onUploadAvatar={handleUploadAvatar}
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
