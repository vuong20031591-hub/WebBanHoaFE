"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, useEffect, useRef } from "react";
import { Flower2, Search, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/lib/cart";
import { useAuth } from "@/src/contexts";

interface ProductSuggestion {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
}

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
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/products/search/suggestions?query=${encodeURIComponent(searchQuery)}&size=5`
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.content || []);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
      setSearchQuery("");
    }
  };

  const handleSuggestionClick = (productId: number) => {
    router.push(`/products/${productId}`);
    setShowSuggestions(false);
    setSearchQuery("");
  };

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
    <nav className="sticky top-0 z-50 border-b border-[#eee3dc]/90 bg-[#fcfaf7]/95 backdrop-blur">
      <div className="mx-auto flex h-[82px] max-w-[1280px] items-center justify-between px-6 sm:px-8 lg:px-10">
        <div className="flex shrink-0 items-center gap-8 lg:gap-12">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Flower2 className="h-6 w-6 text-[#d0bb95]" />
            <span
              className="whitespace-nowrap text-[19px] font-medium tracking-[-0.03em] text-[#2d2a26] sm:text-[20px]"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              Floral Boutique
            </span>
          </Link>

          <div className="hidden shrink-0 items-center gap-8 whitespace-nowrap lg:flex">
            {[
              { label: "Shop All", href: "/products" },
              { label: "Categories", href: "/#categories" },
              { label: "Latest", href: "/#latest" },
              { label: "Our Story", href: "/#our-story" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="whitespace-nowrap text-[14px] font-medium tracking-[0.02em] text-[#2d2a26] transition-colors hover:text-[#c2a07f]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          {user?.role?.toUpperCase() === "ADMIN" ? (
            <Link
              href="/admin"
              className="hidden h-11 items-center justify-center rounded-full border border-[#d8c8bb] bg-[#fff8f3] px-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8a6d5d] transition-colors hover:bg-[#f7ede5] sm:inline-flex"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Admin Panel
            </Link>
          ) : null}

          <div ref={searchRef} className="relative hidden sm:block">
            <form onSubmit={handleSearchSubmit}>
              <div className="flex h-10 w-[250px] items-center rounded-full bg-[#f5f0eb] px-4">
                <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-[#baafa7]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  placeholder="Search arrangements..."
                  className="w-full bg-transparent text-[12px] font-light text-[#2d2a26] placeholder-[#baafa7] outline-none"
                  style={{ fontFamily: "var(--font-inter)" }}
                />
              </div>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-[#eee3dc] bg-white shadow-lg">
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product.id)}
                    className="flex w-full items-center gap-3 border-b border-[#f5f0eb] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#fcfaf7]"
                  >
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p
                        className="text-[13px] font-medium text-[#2d2a26]"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {product.name}
                      </p>
                      <p
                        className="text-[12px] text-[#8a7968]"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        ${product.price.toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showSuggestions && searchQuery.length >= 2 && suggestions.length === 0 && !isSearching && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-[#eee3dc] bg-white px-4 py-3 shadow-lg">
                <p
                  className="text-[12px] text-[#8a7968]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  No products found
                </p>
              </div>
            )}
          </div>

          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#f5f0eb]"
          >
            <ShoppingCart className="h-5 w-5 text-[#2d2a26]" />
            {displayCount > 0 ? (
              <span
                className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[#d0bb95] px-1 text-center text-[10px] font-semibold leading-[18px] text-white"
                style={{ fontFamily: "var(--font-inter)" }}
                aria-label={`${displayCount} items in cart`}
              >
                {countLabel}
              </span>
            ) : null}
          </Link>

          <Link
            href="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#f5f0eb]"
          >
            <User className="h-5 w-5 text-[#2d2a26]" />
          </Link>

          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="hidden h-11 items-center justify-center rounded-full border border-[#ddd1c8] px-5 text-[12px] font-medium text-[#2d2a26] transition-colors hover:bg-[#f5f0eb] disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {isSigningOut ? "Log out..." : "Log out"}
            </button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
