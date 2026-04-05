"use client";

import Link from "next/link";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import { useFavoritesStore } from "@/lib/favorites";
import { useLocale } from "@/src/contexts";
import { ProfileTabs } from "./ProfileTabs";
import { ProfileFavoritesSection } from "./ProfileFavoritesSection";

export function ProfileFavoritesPageContent() {
  const { locale, t } = useLocale();
  const favorites = useFavoritesStore((state) => state.items);

  const profileTabs = [
    { id: "orders", label: t("profile.orders.tabOrders"), href: "/profile", active: false },
    { id: "favorites", label: t("profile.orders.tabFavorites"), href: "/profile/favorites", active: true },
    { id: "settings", label: t("profile.orders.tabSettings"), href: "/profile/settings", active: false },
  ] as const;

  const collection = {
    title: locale === "vi" ? "Danh sách yêu thích" : "Saved Favorites",
    countLabel:
      locale === "vi"
        ? `${favorites.length} sản phẩm`
        : `${favorites.length} item${favorites.length === 1 ? "" : "s"}`,
    ctaLabel: locale === "vi" ? "Duyệt sản phẩm" : "Browse Products",
    ctaHref: "/products",
    items: favorites.map((item) => ({
      id: String(item.productId),
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      href: item.href,
      stockQuantity: item.stockQuantity,
    })),
  };

  return (
    <div className="min-h-screen bg-[#f7f3ed]">
      <Navbar />
      <main className="pb-24">
        <div className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-6 lg:px-10 lg:pt-24">
          <div className="mx-auto max-w-[1100px]">
            <header className="pb-12 lg:pb-16">
              <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-[#d0bb95]">
                {t("profile.settings.accountBadge")}
              </p>
              <h1
                className="mt-4 text-[44px] font-light leading-none text-[#2d2a26]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                {t("profile.orders.tabFavorites")}
              </h1>
              <p className="mt-3 text-[14px] leading-6 text-[#5c6b5e]">
                {locale === "vi"
                  ? "Lưu những mẫu hoa bạn yêu thích và thêm vào giỏ bất cứ lúc nào."
                  : "Save arrangements you love and move them to cart anytime."}
              </p>
            </header>

            <ProfileTabs tabs={[...profileTabs]} />

            {favorites.length === 0 ? (
              <section className="pt-12 lg:pt-16">
                <div className="rounded-[32px] bg-white/60 px-8 py-10 text-center">
                  <h2
                    className="text-[32px] leading-[1.1] text-[#2d2a26]"
                    style={{ fontFamily: "var(--font-noto-serif)" }}
                  >
                    {locale === "vi" ? "Bạn chưa có mục yêu thích" : "No favorites yet"}
                  </h2>
                  <p className="mx-auto mt-3 max-w-[520px] text-[14px] leading-6 text-[#5c6b5e]">
                    {locale === "vi"
                      ? "Nhấn biểu tượng tim trên thẻ sản phẩm để lưu các mẫu hoa bạn yêu thích."
                      : "Tap the heart on product cards to save your favorite arrangements."}
                  </p>
                  <div className="mt-8">
                    <Link
                      href="/products"
                      className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#d0bb95] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571]"
                    >
                      {locale === "vi" ? "Duyệt sản phẩm" : "Browse Products"}
                    </Link>
                  </div>
                </div>
              </section>
            ) : (
              <ProfileFavoritesSection collection={collection} />
            )}
          </div>
        </div>
      </main>
      <Footer />
      <ChatLive />
    </div>
  );
}
