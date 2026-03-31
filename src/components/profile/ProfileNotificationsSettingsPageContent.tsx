import { ChatLive, Footer, Navbar } from "@/components/layout";
import { profileNotificationsSettingsPage } from "@/lib/profile/data";
import { ProfileNotificationsSettingsForm } from "./ProfileNotificationsSettingsForm";
import { ProfileSettingsSidebar } from "./ProfileSettingsSidebar";

export function ProfileNotificationsSettingsPageContent() {
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
              {profileNotificationsSettingsPage.title}
            </h1>
            <p className="mt-2 text-[14px] font-light leading-5 text-[#5c6b5e]">
              {profileNotificationsSettingsPage.subtitle}
            </p>
          </header>

          <div className="mt-12 grid gap-8 xl:grid-cols-[252px_minmax(0,884px)] xl:gap-16">
            <ProfileSettingsSidebar
              navigation={profileNotificationsSettingsPage.navigation}
              rewards={profileNotificationsSettingsPage.rewards}
            />
            <ProfileNotificationsSettingsForm
              emailSection={profileNotificationsSettingsPage.emailSection}
              pushSection={profileNotificationsSettingsPage.pushSection}
              discardLabel={profileNotificationsSettingsPage.discardLabel}
              updateLabel={profileNotificationsSettingsPage.updateLabel}
            />
          </div>
        </div>
      </main>
      <Footer />
      <ChatLive />
    </div>
  );
}
