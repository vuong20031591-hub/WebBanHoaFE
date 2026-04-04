"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ClipboardList,
  Flower2,
  LayoutDashboard,
  Megaphone,
  Package2,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import { adminOrdersApi, adminProductsApi, categoriesApi, isApiError, productsApi } from "@/lib/api";
import type {
  AdminProductUpsertRequest,
  CategoryDTO,
  OrderDTO,
  ProductDTO,
} from "@/lib/api/types";
import { formatCurrency } from "@/lib/currency";
import { resolveProductImage } from "@/lib/mappers/product";
import { useAuth } from "@/src/contexts";

const LOW_STOCK_THRESHOLD = 15;
const PRODUCT_PAGE_SIZE = 120;
const ORDER_PAGE_SIZE = 30;

type InventoryMovement = {
  id: string;
  item: string;
  reference: string;
  adjustment: string;
  source: string;
  date: string;
  isNegative: boolean;
};

type ProductFormState = {
  name: string;
  price: string;
  description: string;
  image: string;
  stockQuantity: string;
  categoryId: string;
};

const INITIAL_PRODUCT_FORM: ProductFormState = {
  name: "",
  price: "",
  description: "",
  image: "",
  stockQuantity: "0",
  categoryId: "",
};

function DashboardStateCard({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#d8d4d4] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-[980px] rounded-[24px] border border-[#ebe5de] bg-[#fbfaf8] px-8 py-16 text-center">
        <h1
          className="text-[38px] leading-[1.1] text-[#2d2a26]"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-[560px] text-[15px] leading-7 text-[#5c6b5e]">
          {description}
        </p>
        {action ? <div className="mt-9">{action}</div> : null}
      </div>
    </div>
  );
}

function toCategoryLabel(value: string | null): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Uncategorized";
}

function normalizeStock(value: number | null): number {
  return typeof value === "number" ? value : 0;
}

function getStockStatusLabel(stockQuantity: number | null): string {
  const stock = normalizeStock(stockQuantity);

  if (stock <= 0) {
    return "Out of stock";
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return "Low stock";
  }

  return "In stock";
}

function getStockStatusClassName(stockQuantity: number | null): string {
  const stock = normalizeStock(stockQuantity);

  if (stock <= 0) {
    return "text-[#8e8a85]";
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return "text-[#c13d3d]";
  }

  return "text-[#5e6e5f]";
}

function formatInventoryDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function ProductCreateModal({
  open,
  categories,
  form,
  submitError,
  submitting,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean;
  categories: CategoryDTO[];
  form: ProductFormState;
  submitError: string | null;
  submitting: boolean;
  onClose: () => void;
  onChange: (field: keyof ProductFormState, value: string) => void;
  onSubmit: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-[620px] rounded-[24px] border border-[#e7dfd5] bg-[#fbfaf8] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-[32px] leading-none text-[#2d2a26]"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              New Botanical Element
            </h2>
            <p className="mt-2 text-[13px] text-[#7c736c]">
              Create a new product and publish it to both admin inventory and storefront.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2ede8] text-[#6e655d] transition-colors hover:bg-[#e7e0d8]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-[12px] text-[#5f564d]">
            Product name
            <input
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              className="h-11 rounded-[14px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
              placeholder="Midnight Dahlia"
            />
          </label>

          <label className="grid gap-2 text-[12px] text-[#5f564d]">
            Price (VND)
            <input
              type="number"
              min="1"
              value={form.price}
              onChange={(event) => onChange("price", event.target.value)}
              className="h-11 rounded-[14px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
              placeholder="350000"
            />
          </label>

          <label className="grid gap-2 text-[12px] text-[#5f564d]">
            Category
            <select
              value={form.categoryId}
              onChange={(event) => onChange("categoryId", event.target.value)}
              className="h-11 rounded-[14px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
            >
              <option value="">Choose category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-[12px] text-[#5f564d]">
            Stock quantity
            <input
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={(event) => onChange("stockQuantity", event.target.value)}
              className="h-11 rounded-[14px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
              placeholder="20"
            />
          </label>

          <label className="grid gap-2 text-[12px] text-[#5f564d] md:col-span-2">
            Image URL or local path
            <input
              value={form.image}
              onChange={(event) => onChange("image", event.target.value)}
              className="h-11 rounded-[14px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
              placeholder="/images/inventory/midnight-dahlia.jpg"
            />
          </label>

          <label className="grid gap-2 text-[12px] text-[#5f564d] md:col-span-2">
            Description
            <textarea
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              className="min-h-[120px] rounded-[18px] border border-[#e4ddd4] bg-white px-4 py-3 outline-none transition-colors focus:border-[#8d6030]"
              placeholder="Describe the arrangement, flowers, and tone."
            />
          </label>
        </div>

        {submitError ? (
          <div className="mt-4 rounded-[16px] border border-[#efd0cc] bg-[#fbefec] px-4 py-3 text-[13px] text-[#8f3d35]">
            {submitError}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#ddd2c6] px-5 text-[12px] font-medium text-[#6a5c4e] transition-colors hover:bg-[#f3eee8]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#8d6030] px-5 text-[12px] font-medium text-white transition-colors hover:bg-[#724e26] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create product"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminInventoryPageContent() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [ordersWindow, setOrdersWindow] = useState<OrderDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [totalSkuCount, setTotalSkuCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [productForm, setProductForm] = useState<ProductFormState>(INITIAL_PRODUCT_FORM);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/signin");
    } finally {
      setIsSigningOut(false);
    }
  };

  const fetchInventoryData = async () => {
    const [productsPage, ordersPage] = await Promise.all([
      productsApi.search({
        page: 0,
        size: PRODUCT_PAGE_SIZE,
        sort: "id,desc",
      }),
      adminOrdersApi.getOrders({
        page: 0,
        size: ORDER_PAGE_SIZE,
        sortBy: "createdAt",
        sortDir: "DESC",
      }),
    ]);

    setProducts(productsPage.content);
    setOrdersWindow(ordersPage.content);
    setTotalSkuCount(productsPage.totalElements ?? productsPage.content.length);
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || !isAdmin) {
      setProducts([]);
      setOrdersWindow([]);
      setCategories([]);
      setTotalSkuCount(0);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;

    const loadInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [categoryData] = await Promise.all([
          categoriesApi.getAll(),
          fetchInventoryData(),
        ]);

        if (!active) {
          return;
        }

        setCategories(categoryData);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setProducts([]);
        setOrdersWindow([]);
        setCategories([]);
        setTotalSkuCount(0);
        setError(
          isApiError(loadError)
            ? loadError.message
            : "Unable to load inventory data right now."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      active = false;
    };
  }, [authLoading, isAdmin, user]);

  const categoryFilters = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((product) => toCategoryLabel(product.categoryName)))
    );

    return ["ALL", ...uniqueCategories.slice(0, 3)];
  }, [products]);

  useEffect(() => {
    if (activeCategory === "ALL") {
      return;
    }

    if (!categoryFilters.includes(activeCategory)) {
      setActiveCategory("ALL");
    }
  }, [activeCategory, categoryFilters]);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          activeCategory === "ALL" || toCategoryLabel(product.categoryName) === activeCategory
      ),
    [activeCategory, products]
  );

  const lowStockCount = useMemo(
    () =>
      products.filter((product) => {
        const stock = normalizeStock(product.stockQuantity);
        return stock > 0 && stock <= LOW_STOCK_THRESHOLD;
      }).length,
    [products]
  );

  const outOfStockCount = useMemo(
    () => products.filter((product) => normalizeStock(product.stockQuantity) === 0).length,
    [products]
  );

  const activeCollectionCount = useMemo(
    () => new Set(products.map((product) => toCategoryLabel(product.categoryName))).size,
    [products]
  );

  const stockMovements = useMemo<InventoryMovement[]>(() => {
    return ordersWindow
      .flatMap((order) =>
        order.items.map((item) => ({
          id: `${order.id}-${item.id}`,
          item: item.productName,
          reference: `PRD-${item.productId}`,
          adjustment: `-${item.quantity} units`,
          source: `Sales Order #${order.id}`,
          date: formatInventoryDate(order.createdAt),
          isNegative: true,
        }))
      )
      .slice(0, 8);
  }, [ordersWindow]);

  const updateProductForm = (field: keyof ProductFormState, value: string) => {
    setProductForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setProductForm(INITIAL_PRODUCT_FORM);
    setSubmitError(null);
  };

  const submitProduct = async () => {
    const payload: AdminProductUpsertRequest = {
      name: productForm.name.trim(),
      price: Number(productForm.price),
      description: productForm.description.trim(),
      image: productForm.image.trim(),
      stockQuantity: Number(productForm.stockQuantity),
      categoryId: Number(productForm.categoryId),
    };

    if (!payload.name || !Number.isFinite(payload.price) || payload.price <= 0) {
      setSubmitError("Please enter a valid product name and price.");
      return;
    }

    if (!Number.isInteger(payload.stockQuantity) || payload.stockQuantity < 0) {
      setSubmitError("Stock quantity must be 0 or greater.");
      return;
    }

    if (!Number.isInteger(payload.categoryId) || payload.categoryId <= 0) {
      setSubmitError("Please choose a category.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await adminProductsApi.createProduct(payload);
      await fetchInventoryData();
      closeCreateModal();
    } catch (submitProductError) {
      setSubmitError(
        isApiError(submitProductError)
          ? submitProductError.message
          : "Unable to create product right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#d8d4d4] px-4 py-10 md:px-8">
        <div className="mx-auto h-[640px] max-w-[1320px] animate-pulse rounded-[24px] bg-[#fbfaf8]" />
      </div>
    );
  }

  if (!user) {
    return (
      <DashboardStateCard
        title="Sign in to view inventory"
        description="Inventory data is only available for authenticated administrators."
        action={
          <Link
            href="/signin"
            className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#8d6030] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#7a542a]"
          >
            Go to Sign In
          </Link>
        }
      />
    );
  }

  if (!isAdmin) {
    return (
      <DashboardStateCard
        title="Admin access required"
        description="Your account does not have permission to open this inventory workspace."
        action={
          <Link
            href="/"
            className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] border border-[#d6cbc0] px-8 text-[14px] font-medium text-[#6d5742] transition-colors hover:bg-[#f5efe8]"
          >
            Back to Store
          </Link>
        }
      />
    );
  }

  return (
    <>
      <ProductCreateModal
        open={isCreateModalOpen}
        categories={categories}
        form={productForm}
        submitError={submitError}
        submitting={isSubmitting}
        onClose={closeCreateModal}
        onChange={updateProductForm}
        onSubmit={() => {
          void submitProduct();
        }}
      />

      <div className="min-h-screen bg-[#d8d4d4] p-3 md:p-7">
        <div className="mx-auto max-w-[1320px] overflow-hidden rounded-[3px] border border-[#e9e3dc] bg-[#fbfaf8]">
        <header className="flex flex-col gap-4 border-b border-[#eee8e1] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-7">
          <div className="flex flex-wrap items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Flower2 className="h-4 w-4 text-[#c8a16a]" />
              <span
                className="text-[21px] text-[#2d2a26]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                Floral Boutique
              </span>
            </Link>
            <div className="flex items-center gap-6 text-[13px] text-[#4d473f]">
              <Link href="/products" className="transition-colors hover:text-[#8d6030]">
                Shop All
              </Link>
              <Link
                href="/products?view=categories"
                className="transition-colors hover:text-[#8d6030]"
              >
                Categories
              </Link>
              <Link
                href="/products?sort=latest"
                className="transition-colors hover:text-[#8d6030]"
              >
                Latest
              </Link>
              <Link href="/our-story" className="transition-colors hover:text-[#8d6030]">
                Our Story
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-[230px] items-center rounded-full bg-[#f2eeea] px-4">
              <Search className="h-3.5 w-3.5 text-[#a8a09a]" />
              <span className="ml-2 text-[12px] text-[#b3aba4]">Search arrangements...</span>
            </div>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#3f3934] transition-colors hover:bg-[#f2eeea]"
              aria-label="Cart"
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
            </button>
            <div className="relative group">
              <Link
                href="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#3f3934] transition-colors hover:bg-[#f2eeea]"
                aria-label="Profile"
              >
                <User className="h-[18px] w-[18px]" />
              </Link>
              <div className="pointer-events-none invisible absolute right-0 top-[calc(100%+8px)] z-50 w-[132px] translate-y-1 rounded-[12px] border border-[#e5ddd4] bg-[#fcfaf7] p-1 opacity-0 shadow-sm transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full rounded-[9px] px-3 py-2 text-left text-[12px] font-medium text-[#5b4f43] transition-colors hover:bg-[#f1eeea] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSigningOut ? "Đang thoát..." : "Đăng xuất"}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-[218px_minmax(0,1fr)]">
          <aside className="border-b border-[#eee8e1] px-4 py-6 md:min-h-[720px] md:border-b-0 md:border-r md:border-[#eee8e1] md:px-5">
            <nav className="space-y-2">
              {[
                { icon: LayoutDashboard, label: "Dashboard", href: "/admin", active: false },
                { icon: ClipboardList, label: "Orders", href: "/admin/orders", active: false },
                { icon: Package2, label: "Products", href: "/admin/products", active: true },
                { icon: Users, label: "Customers", active: false },
                { icon: Megaphone, label: "Marketing", active: false },
                { icon: Settings, label: "Settings", active: false },
              ].map((item) => {
                const className = `flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-[13px] transition-colors ${
                  item.active
                    ? "bg-[#8d6030] text-white"
                    : "text-[#4a433c] hover:bg-[#f1ede7]"
                }`;

                if (item.href) {
                  return (
                    <Link key={item.label} href={item.href} className={className}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                }

                return (
                  <button key={item.label} type="button" className={className}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-14 hidden items-center gap-3 md:flex">
              <div className="h-10 w-10 rounded-full bg-[#ece8e3]" />
              <div>
                <p className="text-[12px] font-medium text-[#3f3934]">{user.fullName}</p>
                <p className="text-[10px] uppercase tracking-[1.2px] text-[#b2aaa2]">
                  Head Florist
                </p>
              </div>
            </div>
          </aside>

          <main className="relative px-4 py-7 md:px-7">
            {loading ? (
              <div className="grid gap-4">
                <div className="h-32 animate-pulse rounded-[18px] bg-[#f0ece7]" />
                <div className="h-64 animate-pulse rounded-[18px] bg-[#f0ece7]" />
              </div>
            ) : error ? (
              <div className="rounded-[18px] border border-[#efd0cc] bg-[#fbefec] px-5 py-4 text-[14px] text-[#8f3d35]">
                {error}
              </div>
            ) : (
              <>
                <p className="text-[32px] leading-none text-[#b2adab] md:text-[36px]">
                  Inventory Management - Floral Boutique
                </p>

                <section className="mt-5">
                  <h1
                    className="text-[46px] leading-[1.04] text-[#2d2a26]"
                    style={{ fontFamily: "var(--font-noto-serif)" }}
                  >
                    The Atelier Inventory
                  </h1>
                  <p className="mt-2 text-[13px] text-[#857d76]">
                    Live inventory synced from product records in your database.
                  </p>
                </section>

                <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <article className="rounded-[14px] border border-[#efe9e2] bg-[#fdfcfa] px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[1.3px] text-[#b8afa7]">
                      Total SKU Count
                    </p>
                    <p className="mt-2 text-[34px] leading-[1] text-[#312c27]">{totalSkuCount}</p>
                    <p className="mt-2 text-[11px] text-[#918981]">
                      {filteredProducts.length} shown by filter
                    </p>
                  </article>
                  <article className="rounded-[14px] border border-[#efe9e2] bg-[#fdfcfa] px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[1.3px] text-[#b8afa7]">
                      Low Stock Alert
                    </p>
                    <p className="mt-2 text-[34px] leading-[1] text-[#312c27]">{lowStockCount}</p>
                    <p className="mt-2 text-[11px] text-[#bf4343]">Need restock soon</p>
                  </article>
                  <article className="rounded-[14px] border border-[#efe9e2] bg-[#fdfcfa] px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[1.3px] text-[#b8afa7]">
                      Active Collections
                    </p>
                    <p className="mt-2 text-[34px] leading-[1] text-[#312c27]">
                      {activeCollectionCount}
                    </p>
                    <p className="mt-2 text-[11px] text-[#918981]">Unique categories</p>
                  </article>
                  <article className="rounded-[14px] border border-[#efe9e2] bg-[#fdfcfa] px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[1.3px] text-[#b8afa7]">
                      Out of Stock
                    </p>
                    <p className="mt-2 text-[34px] leading-[1] text-[#312c27]">{outOfStockCount}</p>
                    <p className="mt-2 text-[11px] text-[#918981]">Unavailable now</p>
                  </article>
                </section>

                <section className="mt-6 flex flex-wrap items-center gap-2">
                  {categoryFilters.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setActiveCategory(label)}
                      className={`rounded-full px-4 py-2 text-[11px] transition-colors ${
                        activeCategory === label
                          ? "bg-[#ece8e3] text-[#4f4841]"
                          : "text-[#6a625b] hover:bg-[#f2ede8]"
                      }`}
                    >
                      {label === "ALL" ? "All Elements" : label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitError(null);
                      setIsCreateModalOpen(true);
                    }}
                    className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#8d6030] px-4 py-2 text-[11px] font-medium text-white transition-colors hover:bg-[#724e26]"
                  >
                    <Plus className="h-3 w-3" />
                    New Botanical Element
                  </button>
                </section>

                <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-full rounded-[14px] border border-[#ece5dc] bg-[#fdfcfa] px-5 py-6 text-[13px] text-[#7a726b]">
                      No products found for this category filter.
                    </div>
                  ) : (
                    filteredProducts.map((product) => {
                      const stock = normalizeStock(product.stockQuantity);
                      const image = resolveProductImage(product.imageUrl);

                      return (
                        <article key={product.id}>
                          <div className="relative h-[205px] overflow-hidden rounded-[22px] bg-[#ece7e1]">
                            <Image
                              src={image}
                              alt={product.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 25vw"
                              className="object-cover"
                            />
                          </div>
                          <div className="mt-2 flex items-start justify-between gap-3">
                            <div>
                              <p
                                className="text-[20px] leading-[1.1] text-[#2f2a26]"
                                style={{ fontFamily: "var(--font-noto-serif)" }}
                              >
                                {product.name}
                              </p>
                              <p className="mt-1 text-[10px] uppercase tracking-[1.1px] text-[#968c82]">
                                Product ID: {product.id}
                              </p>
                            </div>
                            <p className="mt-1 text-[12px] text-[#62584f]">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                          <p className={`mt-2 text-[11px] ${getStockStatusClassName(product.stockQuantity)}`}>
                            {stock > 0 ? `+ ${stock} in stock` : "• Out of stock"} (
                            {getStockStatusLabel(product.stockQuantity)})
                          </p>
                        </article>
                      );
                    })
                  )}
                </section>

                <section className="mt-10 overflow-hidden rounded-[16px] border border-[#eee8e1] bg-[#fcfbf9]">
                  <div className="border-b border-[#efebe5] px-5 py-4">
                    <h2
                      className="text-[34px] leading-none text-[#2d2a26]"
                      style={{ fontFamily: "var(--font-noto-serif)" }}
                    >
                      Stock Adjustment Log
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-[#f1ede8] text-left text-[10px] uppercase tracking-[1.2px] text-[#b6aea7]">
                          <th className="px-5 py-3 font-medium">Botanical Element</th>
                          <th className="px-2 py-3 font-medium">Reference</th>
                          <th className="px-2 py-3 font-medium">Adjustment</th>
                          <th className="px-2 py-3 font-medium">Source</th>
                          <th className="px-5 py-3 text-right font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockMovements.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-5 py-8 text-center text-[13px] text-[#8f877f]"
                            >
                              No stock movement logs from recent orders yet.
                            </td>
                          </tr>
                        ) : (
                          stockMovements.map((log) => (
                            <tr
                              key={log.id}
                              className="border-b border-[#f4f0eb] text-[13px] text-[#3d3731] last:border-none"
                            >
                              <td className="px-5 py-3 font-medium">{log.item}</td>
                              <td className="px-2 py-3 text-[#6f6861]">{log.reference}</td>
                              <td
                                className={`px-2 py-3 font-medium ${
                                  log.isNegative ? "text-[#b63f3f]" : "text-[#4f6951]"
                                }`}
                              >
                                {log.adjustment}
                              </td>
                              <td className="px-2 py-3 text-[#6f6861]">{log.source}</td>
                              <td className="px-5 py-3 text-right text-[#6f6861]">{log.date}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <button
                  type="button"
                  className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#8d6030] text-white transition-colors hover:bg-[#704b23]"
                  aria-label="Quick actions"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
              </>
            )}
          </main>
        </div>
        </div>
      </div>
    </>
  );
}
