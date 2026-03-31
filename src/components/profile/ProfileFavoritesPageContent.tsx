import { ChatLive, Footer, Navbar } from "@/components/layout";
import {
  getProfileTabs,
  profileFavoritesCollection,
  profileMember,
} from "@/lib/profile/data";
import { ProfileFavoritesSection } from "./ProfileFavoritesSection";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./ProfileTabs";

export function ProfileFavoritesPageContent() {
  return (
    <div className="min-h-screen bg-[#f7f3ed]">
      <Navbar />
      <main className="pb-24">
        <div className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-6 lg:px-10 lg:pt-24">
          <div className="mx-auto max-w-[1100px]">
            <ProfileHeader member={profileMember} />
            <ProfileTabs tabs={getProfileTabs("favorites")} />
            <ProfileFavoritesSection collection={profileFavoritesCollection} />
          </div>
        </div>
      </main>
      <Footer />
      <ChatLive />
    </div>
  );
}
