"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { ShoppingCart, User, Search, Flower2 } from "lucide-react";
import { useCartStore } from "@/lib/cart";
import { useAuth } from "@/src/contexts";

function subscribeToCartHydration(onStoreChange: () => void) {
  const unsubscribeStart = useCartStore.persist.onHydrate(onStoreChange);
  const unsubscribeFinish = useCartStore.persist.onFinishHydration(onStoreChange);

  return () => {
    unsubscribeStart();
    unsubscribeFinish();
  };
}

export function Navbar() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const hydrated = useSyncExternalStore(
    subscribeToCartHydration,
    () => useCartStore.persist.hasHydrated(),
    () => false
  );
  const itemCount = useCartStore((state) =>
    state.variants.reduce((sum, item) => sum + item.quantity, 0)
  );
  const displayCount = hydrated ? itemCount : 0;
  const countLabel = displayCount > 99 ? "99+" : String(displayCount);
  const navLinks = [
    { label: "Shop All", href: "/products" },
    { label: "Categories", href: "/products?view=categories" },
    { label: "Latest", href: "/products?sort=latest" },
    { label: "Our Story", href: "/our-story" },
  ];

  if (user?.role?.toUpperCase() === "ADMIN") {
    navLinks.push({ label: "Dashboard", href: "/admin" });
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/signin");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav className="bg-[#fcfaf7] border-b border-[#eee4e1] sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-10 h-[81px] flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-1.5">
            <Flower2 className="text-[#d0bb95] w-6 h-6" />
            <span
              className="text-[#2d2a26] text-[20px] font-medium tracking-[-0.5px]"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              Floral Boutique
            </span>
          </Link>
          <div className="flex items-center gap-9">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[#2d2a26] text-[14px] font-medium tracking-[0.35px] hover:text-[#d0bb95] transition-colors"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="bg-[#f1eeea] rounded-full h-8 px-4 flex items-center w-[232px]">
            <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
            <span
              className="text-gray-400 text-[12px] font-light"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Search arrangements...
            </span>
          </div>
          <Link
            href="/cart"
            className="relative w-10 h-10 flex items-center justify-center hover:bg-[#f1eeea] rounded-full transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-[#2d2a26]" />
            {displayCount > 0 ? (
              <span
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#d0bb95] text-white text-[10px] font-semibold leading-[18px] text-center"
                style={{ fontFamily: "var(--font-inter)" }}
                aria-label={`${displayCount} items in cart`}
              >
                {countLabel}
              </span>
            ) : null}
          </Link>
          {user ? (
            <div className="relative group">
              <Link
                href="/profile"
                className="w-9 h-9 flex items-center justify-center hover:bg-[#f1eeea] rounded-full transition-colors"
                aria-label="Profile"
              >
                <User className="w-5 h-5 text-[#2d2a26]" />
              </Link>
              <div className="pointer-events-none invisible absolute right-0 top-full z-50 w-[132px] translate-y-1 rounded-[12px] border border-[#e5ddd4] bg-[#fcfaf7] p-1 opacity-0 shadow-sm transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full rounded-[9px] px-3 py-2 text-left text-[12px] font-medium text-[#5b4f43] transition-colors hover:bg-[#f1eeea] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {isSigningOut ? "Đang thoát..." : "Đăng xuất"}
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/profile"
              className="w-9 h-9 flex items-center justify-center hover:bg-[#f1eeea] rounded-full transition-colors"
            >
              <User className="w-5 h-5 text-[#2d2a26]" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
