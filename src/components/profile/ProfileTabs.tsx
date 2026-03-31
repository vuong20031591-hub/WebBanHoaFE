import Link from "next/link";
import { ProfileTab } from "@/lib/profile/types";

interface ProfileTabsProps {
  tabs: ProfileTab[];
}

export function ProfileTabs({ tabs }: ProfileTabsProps) {
  return (
    <nav
      aria-label="Profile sections"
      className="border-b border-[rgba(92,107,94,0.12)] pb-4"
    >
      <div className="flex gap-8 overflow-x-auto px-1 sm:justify-center">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={tab.active ? "page" : undefined}
            className={`relative whitespace-nowrap pb-2 text-[14px] font-medium uppercase tracking-[1.4px] transition-colors ${
              tab.active
                ? "text-[#d0bb95] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-[#d0bb95]"
                : "text-[rgba(92,107,94,0.6)] hover:text-[#5c6b5e]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
