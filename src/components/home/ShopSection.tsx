"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { categoriesApi, isApiError } from "@/lib/api";
import { Category } from "@/lib/categories";
import { mapCategoryDTOsToCategories } from "@/lib/mappers";

const CATEGORY_IMAGES = [
  "/images/birthday.png",
  "/images/anniversary.png",
  "/images/sympathy.png",
] as const;

export function ShopSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        if (!active) {
          return;
        }

        setCategories(mapCategoryDTOsToCategories(data).slice(0, 3));
        setError(null);
      } catch (fetchError) {
        if (!active) {
          return;
        }

        setCategories([]);
        setError(
          isApiError(fetchError)
            ? fetchError.message
            : "Unable to load categories right now."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="bg-[#f7f3ed] py-24">
      <div className="max-w-[1280px] mx-auto px-[160px]">
        <div className="text-center mb-16">
          <p
            className="text-[#d0bb95] text-[16px] font-bold tracking-[2px] uppercase mb-[10px]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            CHOOSE YOUR MOMENT
          </p>
          <h2
            className="text-[#2d2a26] text-[48px] font-light leading-[48px]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            Shop by Category
          </h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center gap-[86px]">
            {CATEGORY_IMAGES.map((image) => (
              <div key={image} className="flex flex-col items-center gap-6">
                <div className="w-[277px] h-[282px] rounded-full bg-white/60 animate-pulse" />
                <div className="h-8 w-40 rounded-full bg-white/60 animate-pulse" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mx-auto max-w-[520px] rounded-[28px] border border-[rgba(208,187,149,0.3)] bg-white/70 px-8 py-10 text-center">
            <p
              className="text-[#2d2a26] text-[24px] font-light leading-8"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              Categories unavailable
            </p>
            <p className="mt-3 text-[14px] leading-6 text-[#5c6b5e]">
              {error}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-[86px]">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/products?categoryId=${category.id}`}
                className="flex flex-col items-center gap-6 group cursor-pointer"
              >
                <div className="w-[277px] h-[282px] rounded-full border-[8px] border-[#c2a571] overflow-hidden relative transition-transform group-hover:scale-105 duration-300">
                  <Image
                    src={CATEGORY_IMAGES[index % CATEGORY_IMAGES.length]}
                    alt={category.name}
                    fill
                    sizes="277px"
                    className="object-cover"
                  />
                </div>
                <span
                  className="text-[#2d2a26] text-[24px] font-normal leading-[32px] tracking-[-0.6px] text-center"
                  style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
