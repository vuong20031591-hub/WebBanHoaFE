"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Suspense, useEffect, useState, useCallback } from "react";
import { PackageSearch } from "lucide-react";
import { Product, ProductService } from "@/lib/products";
import { Category, CategoryRepository } from "@/lib/categories";
import { ProductCard, ProductFilter } from "@/components/products";
import { Navbar, Footer } from "@/components/layout";
import { ContactSection } from "@/components/home";

const PAGE_SIZE = 6;











/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
function ProductsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const categories: Category[] = CategoryRepository.getAll();

  const [filters, setFilters] = useState({
    name: searchParams.get("name") || "",
    categoryId: searchParams.get("categoryId") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });
  const [nameInput, setNameInput] = useState(filters.name);

  useEffect(() => {
    const next = {
      name: searchParams.get("name") || "",
      categoryId: searchParams.get("categoryId") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
    };
    setFilters(next);
    setNameInput(next.name);
  }, [searchParamsString, searchParams]);

  /* Sync filter state → URL params */
  const applyFilters = useCallback(
    (newFilters: typeof filters) => {
      const p = new URLSearchParams();
      if (newFilters.name) p.set("name", newFilters.name);
      if (newFilters.categoryId) p.set("categoryId", newFilters.categoryId);
      if (newFilters.minPrice) p.set("minPrice", newFilters.minPrice);
      if (newFilters.maxPrice) p.set("maxPrice", newFilters.maxPrice);
      p.set("page", "0");
      router.push(`${pathname}?${p.toString()}`);
    },
    [pathname, router]
  );

  const handleFilterChange = (key: string, value: string) => {
    if (key === "name") {
      setNameInput(value);
      return;
    }
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    applyFilters(updated);
  };

  /* Debounce name search */
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (nameInput === filters.name) return;
      const updated = { ...filters, name: nameInput };
      setFilters(updated);
      applyFilters(updated);
    }, 300);
    return () => clearTimeout(timeout);
  }, [nameInput, filters, applyFilters]);

  const currentPage = Number(searchParams.get("page") || "0");
  const filtered = ProductService.filter(filters);
  const pageData = ProductService.paginate(filtered, currentPage, PAGE_SIZE);

  return (
    <div className="bg-[#f7f3ed] min-h-screen">
      <Navbar />

      {/* ── Header ── */}
      <div className="bg-[#f7f3ed] h-[245px] flex items-center justify-center">
        <div className="text-center">
          <p
            className="text-[#d0bb95] text-[10px] font-bold tracking-[4px] uppercase mb-4"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            THE CURATED GALLERY
          </p>
          <h1
            className="text-black text-[72px] font-light leading-[72px] tracking-[4px]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            All Products
          </h1>
          <p
            className="text-[rgba(92,107,94,0.8)] text-[18px] font-light leading-[29.25px] mt-3 max-w-[580px]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Designed to breathe life into every corner of your home with organic textures and timeless grace.
          </p>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="max-w-[1280px] mx-auto px-[54px] py-14 flex gap-16">
        {/* Sidebar */}
        <ProductFilter
          name={nameInput}
          categoryId={filters.categoryId}
          categories={categories}
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onChange={handleFilterChange}
        />

        {/* Product grid */}
        <div className="flex-1">
          {pageData.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <PackageSearch className="w-12 h-12 text-[#d0bb95]" />
              <p
                className="text-[#5c6b5e] text-[18px] font-light"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                No arrangements found
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-6">
                {pageData.content.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {pageData.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <button
                    disabled={pageData.first}
                    onClick={() =>
                      router.push(
                        `${pathname}?${new URLSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: (pageData.number - 1).toString(),
                        })}`
                      )
                    }
                    className="w-10 h-10 rounded-full border border-[rgba(208,187,149,0.3)] text-[#d0bb95] hover:bg-[rgba(208,187,149,0.1)] transition-colors disabled:opacity-30 flex items-center justify-center"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    ‹
                  </button>
                  {Array.from({ length: pageData.totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        router.push(
                          `${pathname}?${new URLSearchParams({
                            ...Object.fromEntries(searchParams),
                            page: i.toString(),
                          })}`
                        )
                      }
                      className={`w-10 h-10 rounded-full text-[14px] font-medium transition-colors ${
                        pageData.number === i
                          ? "bg-[#d0bb95] text-white"
                          : "border border-[rgba(208,187,149,0.3)] text-[#d0bb95] hover:bg-[rgba(208,187,149,0.1)]"
                      }`}
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={pageData.last}
                    onClick={() =>
                      router.push(
                        `${pathname}?${new URLSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: (pageData.number + 1).toString(),
                        })}`
                      )
                    }
                    className="w-10 h-10 rounded-full border border-[rgba(208,187,149,0.3)] text-[#d0bb95] hover:bg-[rgba(208,187,149,0.1)] transition-colors disabled:opacity-30 flex items-center justify-center"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Join Bloom Club ── */}
      <ContactSection />

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="bg-[#f7f3ed] min-h-screen" />}>
      <ProductsPageContent />
    </Suspense>
  );
}
