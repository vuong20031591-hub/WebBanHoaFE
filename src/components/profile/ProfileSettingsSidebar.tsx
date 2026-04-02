import Image from "next/image";
import Link from "next/link";
import { Bell, Lock, Settings2, UserRound } from "lucide-react";
import {
  ProfileRewardsCard,
  ProfileSettingsNavIcon,
  ProfileSettingsNavItem,
} from "@/lib/profile/types";

const iconMap: Record<ProfileSettingsNavIcon, typeof UserRound> = {
  account: UserRound,
  security: Lock,
  notifications: Bell,
  preferences: Settings2,
};

interface ProfileSettingsSidebarProps {
  navigation: ProfileSettingsNavItem[];
  rewards: ProfileRewardsCard;
}

function RewardsIcon() {
  return (
    <Image
      src="/images/settings/Rewards_Icon.svg"
      alt=""
      width={96}
      height={96}
      className="h-24 w-24 object-contain"
    />
  );
}

export function ProfileSettingsSidebar({
  navigation,
  rewards,
}: ProfileSettingsSidebarProps) {
  return (
    <aside className="space-y-[47px]">
      <div className="space-y-1">
        {navigation.map((item) => {
          const Icon = iconMap[item.icon];
          const sharedClassName = `flex h-[53px] w-full items-center gap-3 rounded-[16px] px-5 text-left transition-colors ${
            item.active
              ? "bg-[rgba(255,255,255,0.99)] text-[#ceb996]"
              : "text-[#5b6a5f] hover:bg-white/60"
          }`;
          const content = (
            <>
              <Icon className="h-6 w-6" />
              <span
                className={`text-[14px] leading-5 ${
                  item.active ? "font-medium" : "font-light"
                }`}
              >
                {item.label}
              </span>
            </>
          );

          if (item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={sharedClassName}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.active}
              className={sharedClassName}
            >
              {content}
            </button>
          );
        })}
      </div>

      <div className="relative min-h-[175px] overflow-hidden rounded-[24px] bg-[#fef5f6] px-8 py-8">
        <div className="relative z-10 max-w-[184px]">
          <h2
            className="text-[18px] font-light leading-7 text-[#2d2a26]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            {rewards.title}
          </h2>
          <p className="mt-2 text-[12px] font-light leading-4 text-[#5c6b5e]">
            {rewards.description}
          </p>
          <button
            type="button"
            className="mt-[23px] text-[10px] font-bold uppercase tracking-[1px] text-[#d0bb95]"
          >
            {rewards.ctaLabel}
          </button>
        </div>

        <div className="pointer-events-none absolute bottom-[-18px] right-[-16px] opacity-[0.20]">
          <RewardsIcon />
        </div>
      </div>
    </aside>
  );
}
