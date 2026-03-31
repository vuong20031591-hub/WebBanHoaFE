import { ChatLive, Footer, Navbar } from "@/components/layout";
import { profileSecuritySettingsPage } from "@/lib/profile/data";
import { ProfileSecuritySettingsForm } from "./ProfileSecuritySettingsForm";
import { ProfileSettingsSidebar } from "./ProfileSettingsSidebar";

export function ProfileSecuritySettingsPageContent() {
  return (
    <div className="min-h-screen bg-[#fcfaf7]">
      <Navbar />
      <main className="pb-24 pt-16 lg:pt-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
          <header className="max-w-[1200px]">
            <h1
              className="text-[40px] font-light leading-none tracking-[-1.2px] text-[#2d2a26] lg:text-[48px]"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              {profileSecuritySettingsPage.title}
            </h1>
            <p className="mt-2 text-[14px] font-light leading-5 text-[#5c6b5e]">
              {profileSecuritySettingsPage.subtitle}
            </p>
          </header>

          <div className="mt-12 grid gap-8 xl:grid-cols-[252px_minmax(0,884px)] xl:gap-16">
            <ProfileSettingsSidebar
              navigation={profileSecuritySettingsPage.navigation}
              rewards={profileSecuritySettingsPage.rewards}
            />
            <ProfileSecuritySettingsForm
              passwordSectionTitle={profileSecuritySettingsPage.passwordSectionTitle}
              passwordSectionSubtitle={
                profileSecuritySettingsPage.passwordSectionSubtitle
              }
              passwordFields={profileSecuritySettingsPage.passwordFields}
              updatePasswordLabel={profileSecuritySettingsPage.updatePasswordLabel}
              twoFactorTitle={profileSecuritySettingsPage.twoFactorTitle}
              twoFactorSubtitle={profileSecuritySettingsPage.twoFactorSubtitle}
              twoFactorOptions={profileSecuritySettingsPage.twoFactorOptions}
              cancelLabel={profileSecuritySettingsPage.cancelLabel}
              saveLabel={profileSecuritySettingsPage.saveLabel}
            />
          </div>
        </div>
      </main>
      <Footer />
      <ChatLive />
    </div>
  );
}
