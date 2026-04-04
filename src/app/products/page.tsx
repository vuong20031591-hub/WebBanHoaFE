"use client";

import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { PackageSearch } from "lucide-react";
import { Product } from "@/lib/products";
import { Category } from "@/lib/categories";
import { categoriesApi, isApiError, productsApi } from "@/lib/api";
import {
  DEFAULT_PRODUCT_IMAGE,
  mapCategoryDTOsToCategories,
  mapProductDTOToProduct,
  mapProductDTOsToProducts,
} from "@/lib/mappers";
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
  const [isLoadingCategoryCovers, setIsLoadingCategoryCovers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryCoverById, setCategoryCoverById] = useState<Record<number, string>>({});
  const viewMode = searchParams.get("view") || "";
  const sortMode = searchParams.get("sort") || "";
  const isCategoriesView = viewMode === "categories";
  const isLatestView = sortMode === "latest";

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

  const selectedCategoryName = useMemo(() => {
    if (!filters.categoryId) {
      return "";
    }

    const matchedCategory = categories.find(
      (category) => String(category.id) === filters.categoryId
    );

    return matchedCategory?.name ?? "";
  }, [categories, filters.categoryId]);

  const showCategoryLanding = isCategoriesView && !filters.categoryId;

  const headingTitle = selectedCategoryName
    ? selectedCategoryName
    : showCategoryLanding
      ? "All Categories"
      : isCategoriesView
        ? "Categories"
      : isLatestView
        ? "Latest Products"
        : "All Products";

  const headingDescription = showCategoryLanding
    ? "Explore our curated collections, tailored to suit every occasion and style."
    : isCategoriesView
      ? "Browse floral collections by category and pick the perfect arrangement."
    : isLatestView
      ? "Fresh arrivals curated for this week, ready to brighten every moment."
      : "Designed to breathe life into every corner of your home with organic textures and timeless grace.";

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

  useEffect(() => {
    if (!isCategoriesView || categories.length === 0) {
      setCategoryCoverById({});
      return;
    }

    let active = true;

    const loadCategoryCovers = async () => {
      setIsLoadingCategoryCovers(true);

      try {
        const coverEntries = await Promise.all(
          categories.map(async (category) => {
            try {
              const response = await productsApi.search({
                categoryId: category.id,
                page: 0,
                size: 1,
                sort: "id,desc",
              });
              const firstProduct = response.content[0];
              const image = firstProduct
                ? mapProductDTOToProduct(firstProduct).image
                : DEFAULT_PRODUCT_IMAGE;
              return [category.id, image] as const;
            } catch {
              return [category.id, DEFAULT_PRODUCT_IMAGE] as const;
            }
          })
        );

        if (!active) {
          return;
        }

        setCategoryCoverById(Object.fromEntries(coverEntries));
      } finally {
        if (active) {
          setIsLoadingCategoryCovers(false);
        }
      }
    };

    loadCategoryCovers();

    return () => {
      active = false;
    };
  }, [categories, isCategoriesView]);

  const currentPage = Math.max(0, Number(searchParams.get("page") || "0") || 0);

  useEffect(() => {
    if (showCategoryLanding) {
      setIsLoadingProducts(false);
      setError(null);
      setPageData(EMPTY_PAGE_STATE);
      return;
    }

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
          sort: isLatestView ? "id,desc" : undefined,
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
  }, [
    currentPage,
    filters.categoryId,
    filters.maxPrice,
    filters.minPrice,
    filters.name,
    isLatestView,
    showCategoryLanding,
  ]);

  const buildParams = useCallback(
    (nextFilters: {
      name: string;
      categoryId: string;
      minPrice: string;
      maxPrice: string;
    }) => {
      const params = new URLSearchParams();

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

      if (viewMode) {
        params.set("view", viewMode);
      }

      if (sortMode) {
        params.set("sort", sortMode);
      }

      params.set("page", "0");
      return params;
    },
    [sortMode, viewMode]
  );

  const handleFilterChange = (key: string, value: string) => {
    if (key === "name") {
      setNameInput(value);
      return;
    }

    const nextFilters = { ...filters, [key]: value };
    const params = buildParams(nextFilters);
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (nameInput === filters.name) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const params = buildParams({
        name: nameInput,
        categoryId: filters.categoryId,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      });
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
    buildParams,
  ]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#f7f3ed]">
      <Navbar />

      <div className="flex min-h-[220px] items-center justify-center bg-[#f7f3ed] px-5 py-10 sm:min-h-[245px] sm:px-6">
        <div className="text-center">
          <p
            className="text-[#d0bb95] text-[10px] font-bold tracking-[4px] uppercase mb-4"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            THE CURATED GALLERY
          </p>
          <h1
            className="text-black text-[38px] font-light leading-[1.1] tracking-[2px] sm:text-[54px] sm:tracking-[3px] lg:text-[72px] lg:leading-[72px] lg:tracking-[4px]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            {headingTitle}
          </h1>
          <p
            className="mt-3 max-w-[580px] text-[15px] font-light leading-7 text-[rgba(92,107,94,0.8)] sm:text-[18px] sm:leading-[29.25px]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {headingDescription}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-[54px] lg:py-14">
        {showCategoryLanding ? (
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
            <ProductFilter
              name={nameInput}
              categoryId={filters.categoryId}
              categories={isLoadingCategories ? [] : categories}
              minPrice={filters.minPrice}
              maxPrice={filters.maxPrice}
              onChange={handleFilterChange}
            />

            <div className="flex-1">
              {isLoadingCategories || isLoadingCategoryCovers ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div
                      key={index}
                      className="h-[270px] rounded-[18px] border border-white/40 bg-white/55 animate-pulse"
                    />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <div className="flex h-[280px] items-center justify-center rounded-[24px] bg-white/55">
                  <p className="text-[14px] text-[#7b7268]">No categories available right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleFilterChange("categoryId", String(category.id))}
                      className="group rounded-[18px] border border-white/50 bg-white/70 px-4 pb-4 pt-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(91,74,54,0.12)]"
                    >
                      <div className="relative mx-auto h-[200px] w-[170px] overflow-hidden rounded-[110px_110px_14px_14px] bg-[#ebe5de]">
                        <Image
                          src={categoryCoverById[category.id] ?? DEFAULT_PRODUCT_IMAGE}
                          alt={category.name}
                          fill
                          sizes="170px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <p
                        className="mt-3 text-[13px] text-[#4b433a]"
                        style={{ fontFamily: "var(--font-noto-serif)" }}
                      >
                        {category.name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
            <ProductFilter
              name={nameInput}
              categoryId={filters.categoryId}
              categories={isLoadingCategories ? [] : categories}
              minPrice={filters.minPrice}
              maxPrice={filters.maxPrice}
              onChange={handleFilterChange}
            />

            <div className="flex-1">
              {isCategoriesView && categories.length > 0 && (
                <div className="mb-8 rounded-[24px] border border-[rgba(208,187,149,0.3)] bg-white/60 px-5 py-4">
                  <p
                    className="mb-3 text-[12px] font-semibold uppercase tracking-[1.6px] text-[#6f655a]"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Browse Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleFilterChange("categoryId", "")}
                      className={`rounded-full px-4 py-2 text-[13px] transition-colors ${
                        !filters.categoryId
                          ? "bg-[#8d6030] text-white"
                          : "bg-[#f1ede7] text-[#5f5548] hover:bg-[#e9e2d9]"
                      }`}
                    >
                      All categories
                    </button>
                    {categories.map((category) => {
                      const isActive = filters.categoryId === String(category.id);

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleFilterChange("categoryId", String(category.id))}
                          className={`rounded-full px-4 py-2 text-[13px] transition-colors ${
                            isActive
                              ? "bg-[#8d6030] text-white"
                              : "bg-[#f1ede7] text-[#5f5548] hover:bg-[#e9e2d9]"
                          }`}
                        >
                          {category.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

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
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {pageData.content.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {pageData.totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-2 overflow-x-auto pb-2 sm:gap-3">
                      <button
                        disabled={pageData.first}
                        onClick={() => handlePageChange(pageData.number - 1)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(208,187,149,0.3)] text-[#d0bb95] transition-colors hover:bg-[rgba(208,187,149,0.1)] disabled:opacity-30"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        ‹
                      </button>
                      {Array.from({ length: pageData.totalPages }, (_, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index)}
                          className={`h-10 w-10 shrink-0 rounded-full text-[14px] font-medium transition-colors ${
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
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(208,187,149,0.3)] text-[#d0bb95] transition-colors hover:bg-[rgba(208,187,149,0.1)] disabled:opacity-30"
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
        )}
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
