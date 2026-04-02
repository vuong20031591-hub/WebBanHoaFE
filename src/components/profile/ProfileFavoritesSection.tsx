import Link from "next/link";
import { ProfileFavoritesCollection } from "@/lib/profile/types";
import { ProfileFavoriteCard } from "./ProfileFavoriteCard";

interface ProfileFavoritesSectionProps {
  collection: ProfileFavoritesCollection;
}

export function ProfileFavoritesSection({
  collection,
}: ProfileFavoritesSectionProps) {
  return (
    <section className="pt-12 lg:pt-16">
      <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-0">
        <h2
          className="text-[32px] font-light leading-[1.1] text-[#2d2a26] lg:text-[30px]"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          {collection.title}
        </h2>
        <p className="text-[12px] font-light tracking-[1.2px] text-[#5c6b5e]">
          {collection.countLabel}
        </p>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3 xl:gap-10">
        {collection.items.map((item) => (
          <ProfileFavoriteCard key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href={collection.ctaHref}
          className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#d0bb95] px-10 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571]"
        >
          {collection.ctaLabel}
        </Link>
      </div>
    </section>
  );
}
