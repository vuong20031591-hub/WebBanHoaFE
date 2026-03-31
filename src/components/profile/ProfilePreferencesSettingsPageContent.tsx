import { ChatLive, Footer, Navbar } from "@/components/layout";
import { profilePreferencesSettingsPage } from "@/lib/profile/data";
import { ProfilePreferencesSettingsForm } from "./ProfilePreferencesSettingsForm";
import { ProfileSettingsSidebar } from "./ProfileSettingsSidebar";

export function ProfilePreferencesSettingsPageContent() {
  return (
    <div className="min-h-screen bg-[#fdfbf9]">
      <Navbar />
      <main className="pb-24 pt-16 lg:pt-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
          <div className="max-w-[1072px]">
            <header>
              <h1
                className="text-[32px] font-light leading-[1.1] tracking-[-0.9px] text-[#3a342f] lg:text-[36px]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                {profilePreferencesSettingsPage.title}
              </h1>
              <p className="mt-2 text-[14px] font-light leading-5 text-[rgba(92,107,94,0.8)]">
                {profilePreferencesSettingsPage.subtitle}
              </p>
            </header>

            <div className="mt-16 grid gap-8 xl:grid-cols-[252px_minmax(0,784px)] xl:gap-9">
              <ProfileSettingsSidebar
                navigation={profilePreferencesSettingsPage.navigation}
                rewards={profilePreferencesSettingsPage.rewards}
              />
              <ProfilePreferencesSettingsForm
                regionalSection={profilePreferencesSettingsPage.regionalSection}
                giftingSection={profilePreferencesSettingsPage.giftingSection}
                saveLabel={profilePreferencesSettingsPage.saveLabel}
                resetLabel={profilePreferencesSettingsPage.resetLabel}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ChatLive />
    </div>
  );
}
