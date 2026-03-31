import Image from "next/image";
import Link from "next/link";
import { PencilLine } from "lucide-react";
import { ProfileMember } from "@/lib/profile/types";

interface ProfileHeaderProps {
  member: ProfileMember;
}

export function ProfileHeader({ member }: ProfileHeaderProps) {
  return (
    <section className="pb-12 lg:pb-16">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        <div className="relative h-32 w-32 overflow-hidden rounded-full bg-[#fef5f6] ring-1 ring-white/80 sm:h-40 sm:w-40">
          <Image
            src={member.avatar}
            alt={member.name}
            fill
            sizes="160px"
            className="object-cover"
            priority
          />
        </div>

        <div className="flex-1">
          <div className="inline-flex rounded-full bg-[rgba(208,187,149,0.1)] px-4 py-[5px]">
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#d0bb95]">
              {member.membershipLabel}
            </span>
          </div>

          <h1
            className="mt-4 text-[36px] font-light leading-none text-[#2d2a26] sm:text-[44px] lg:text-[48px]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            {member.name}
          </h1>

          <p className="mt-3 text-[14px] font-light leading-5 tracking-[0.35px] text-[#5c6b5e]">
            {member.email}
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-start lg:gap-8">
            <div>
              <p
                className="text-[12px] font-light uppercase tracking-[1.2px] text-[rgba(208,187,149,0.8)]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                Phone
              </p>
              <p className="mt-1 text-[14px] font-light leading-5 text-[#5c6b5e]">
                {member.phone}
              </p>
            </div>

            <div className="max-w-[330px]">
              <p
                className="text-[12px] font-light uppercase tracking-[1.2px] text-[rgba(208,187,149,0.8)]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                Primary Address
              </p>
              <p className="mt-1 text-[14px] font-light leading-[22px] text-[#5c6b5e]">
                {member.address}
              </p>
            </div>

            <div className="lg:justify-self-end">
              <Link
                href={member.editHref}
                className="inline-flex items-center gap-2 px-1 py-1 text-[12px] font-medium uppercase tracking-[1.8px] text-[#d0bb95] transition-opacity hover:opacity-70"
              >
                <PencilLine className="h-5 w-5" />
                <span>Edit Details</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
