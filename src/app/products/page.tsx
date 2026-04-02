"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { PackageSearch } from "lucide-react";
import { Product } from "@/lib/products";
import { Category } from "@/lib/categories";
import { categoriesApi, isApiError, productsApi } from "@/lib/api";
import { mapCategoryDTOsToCategories, mapProductDTOsToProducts } from "@/lib/mappers";
import { ProductCard, ProductFilter } from "@/components/products";
import { Navbar, Footer } from "@/components/layout";
import { ContactSection } from "@/components/home";

const PAGE_SIZE = 6;

interface ProductPageState {
  content: Product[];
  totalPages: number;
  totalElements: number;
  number: number;
  first: boolean;
  last: boolean;
}

const EMPTY_PAGE_STATE: ProductPageState = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  number: 0,
  first: true,
  last: true,
};

function ProductsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [pageData, setPageData] = useState<ProductPageState>(EMPTY_PAGE_STATE);
  const [nameInput, setNameInput] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      name: searchParams.get("name") || "",
      categoryId: searchParams.get("categoryId") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
    }),
    [searchParams]
  );

  useEffect(() => {
    setNameInput(filters.name);
  }, [filters.name]);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        if (!active) {
          return;
        }

        setCategories(mapCategoryDTOsToCategories(data));
      } catch {
        if (!active) {
          return;
        }

        setCategories([]);
      } finally {
        if (active) {
          setIsLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const currentPage = Math.max(0, Number(searchParams.get("page") || "0") || 0);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      setIsLoadingProducts(true);
      setError(null);

      try {
        const data = await productsApi.search({
          name: filters.name || undefined,
          categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
          minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
          maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
          page: currentPage,
          size: PAGE_SIZE,
        });

        if (!active) {
          return;
        }

        const content = mapProductDTOsToProducts(data.content);
        const number = data.number ?? data.currentPage;

        setPageData({
          content,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          number,
          first: data.first ?? number === 0,
          last: data.last ?? (data.totalPages === 0 || number >= data.totalPages - 1),
        });
      } catch (fetchError) {
        if (!active) {
          return;
        }

        setPageData(EMPTY_PAGE_STATE);
        setError(
          isApiError(fetchError)
            ? fetchError.message
            : "Unable to load products right now."
        );
      } finally {
        if (active) {
          setIsLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [currentPage, filters.categoryId, filters.maxPrice, filters.minPrice, filters.name]);

  const handleFilterChange = (key: string, value: string) => {
    if (key === "name") {
      setNameInput(value);
      return;
    }

    const params = new URLSearchParams();
    const nextFilters = { ...filters, [key]: value };

    if (nextFilters.name) {
      params.set("name", nextFilters.name);
    }
    if (nextFilters.categoryId) {
      params.set("categoryId", nextFilters.categoryId);
    }
    if (nextFilters.minPrice) {
      params.set("minPrice", nextFilters.minPrice);
    }
    if (nextFilters.maxPrice) {
      params.set("maxPrice", nextFilters.maxPrice);
    }

    params.set("page", "0");
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (nameInput === filters.name) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams();

      if (nameInput) {
        params.set("name", nameInput);
      }
      if (filters.categoryId) {
        params.set("categoryId", filters.categoryId);
      }
      if (filters.minPrice) {
        params.set("minPrice", filters.minPrice);
      }
      if (filters.maxPrice) {
        params.set("maxPrice", filters.maxPrice);
      }

      params.set("page", "0");
      router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    filters.categoryId,
    filters.maxPrice,
    filters.minPrice,
    filters.name,
    nameInput,
    pathname,
    router,
  ]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-[#f7f3ed] min-h-screen">
      <Navbar />

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
            Designed to breathe life into every corner of your home with organic
            textures and timeless grace.
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-[54px] py-14 flex gap-16">
        <ProductFilter
          name={nameInput}
          categoryId={filters.categoryId}
          categories={isLoadingCategories ? [] : categories}
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onChange={handleFilterChange}
        />

        <div className="flex-1">
          {error ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4 rounded-[32px] bg-white/50 px-8 text-center">
              <PackageSearch className="w-12 h-12 text-[#d0bb95]" />
              <p
                className="text-[#2d2a26] text-[24px] font-light"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                Unable to load products
              </p>
              <p className="max-w-[440px] text-[14px] leading-6 text-[#5c6b5e]">
                {error}
              </p>
            </div>
          ) : isLoadingProducts ? (
            <div className="grid grid-cols-3 gap-6">
              {Array.from({ length: PAGE_SIZE }, (_, index) => (
                <div
                  key={index}
                  className="h-[520px] rounded-[32px] bg-white/50 animate-pulse"
                />
              ))}
            </div>
          ) : pageData.content.length === 0 ? (
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
                {pageData.content.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {pageData.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <button
                    disabled={pageData.first}
                    onClick={() => handlePageChange(pageData.number - 1)}
                    className="w-10 h-10 rounded-full border border-[rgba(208,187,149,0.3)] text-[#d0bb95] hover:bg-[rgba(208,187,149,0.1)] transition-colors disabled:opacity-30 flex items-center justify-center"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    ‹
                  </button>
                  {Array.from({ length: pageData.totalPages }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index)}
                      className={`w-10 h-10 rounded-full text-[14px] font-medium transition-colors ${
                        pageData.number === index
                          ? "bg-[#d0bb95] text-white"
                          : "border border-[rgba(208,187,149,0.3)] text-[#d0bb95] hover:bg-[rgba(208,187,149,0.1)]"
                      }`}
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    disabled={pageData.last}
                    onClick={() => handlePageChange(pageData.number + 1)}
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

      <ContactSection />
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
