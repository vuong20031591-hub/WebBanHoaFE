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
} from "lucide-react";
import {
  adminOrdersApi,
  adminProductsApi,
  categoriesApi,
  isApiError,
  productsApi,
} from "@/lib/api";
import type { AdminProductUpsertPayload } from "@/lib/api/admin";
import type { CategoryDTO, OrderDTO, ProductDTO, ProductDetailDTO } from "@/lib/api/types";
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

function createEmptyProductForm(defaultCategoryId: string): ProductFormState {
  return {
    name: "",
    price: "",
    description: "",
    image: "",
    stockQuantity: "0",
    categoryId: defaultCategoryId,
  };
}

function toProductDto(detail: ProductDetailDTO): ProductDTO {
  return {
    id: detail.id,
    name: detail.name,
    price: detail.price,
    description: detail.description,
    imageUrl: detail.image,
    stockQuantity: detail.stockQuantity,
    categoryName: detail.categoryName,
  };
}

export function AdminInventoryPageContent() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [ordersWindow, setOrdersWindow] = useState<OrderDTO[]>([]);
  const [totalSkuCount, setTotalSkuCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [openActionProductId, setOpenActionProductId] = useState<number | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState<ProductFormState>(
    createEmptyProductForm("")
  );

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

  const defaultCategoryId = categories.length > 0 ? String(categories[0].id) : "";

  const openCreateProductForm = () => {
    setFormMode("create");
    setEditingProductId(null);
    setFormError(null);
    setActionError(null);
    setProductForm(createEmptyProductForm(defaultCategoryId));
    setShowProductForm(true);
  };

  const openEditProductForm = async (productId: number) => {
    setOpenActionProductId(null);
    setFormMode("edit");
    setEditingProductId(productId);
    setFormError(null);
    setActionError(null);
    setIsSavingProduct(true);
    setShowProductForm(true);

    try {
      const detail = await productsApi.getById(productId);
      setProductForm({
        name: detail.name,
        price: String(detail.price),
        description: detail.description ?? "",
        image: detail.image ?? "",
        stockQuantity: String(detail.stockQuantity ?? 0),
        categoryId: String(detail.categoryId),
      });
    } catch (loadError) {
      setFormError(
        isApiError(loadError)
          ? loadError.message
          : "Unable to load product details for editing."
      );
    } finally {
      setIsSavingProduct(false);
    }
  };

  const closeProductForm = () => {
    setShowProductForm(false);
    setIsSavingProduct(false);
    setFormError(null);
    setEditingProductId(null);
    setProductForm(createEmptyProductForm(defaultCategoryId));
  };

  const handleProductFormChange = (key: keyof ProductFormState, value: string) => {
    setProductForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleDeleteProduct = async (productId: number) => {
    setActionError(null);
    setDeletingProductId(productId);
    setOpenActionProductId(null);

    try {
      await adminProductsApi.deleteProduct(productId);
      setProducts((previous) => previous.filter((product) => product.id !== productId));
      setTotalSkuCount((previous) => Math.max(0, previous - 1));
    } catch (deleteError) {
      setActionError(
        isApiError(deleteError) ? deleteError.message : "Unable to delete product."
      );
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleSaveProduct = async () => {
    setFormError(null);
    setActionError(null);

    const name = productForm.name.trim();
    const price = Number(productForm.price);
    const stockQuantity = Number(productForm.stockQuantity);
    const categoryId = Number(productForm.categoryId);

    if (!name) {
      setFormError("Product name is required.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setFormError("Price must be greater than 0.");
      return;
    }

    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      setFormError("Stock quantity must be an integer >= 0.");
      return;
    }

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      setFormError("Please select a valid category.");
      return;
    }

    const payload: AdminProductUpsertPayload = {
      name,
      price,
      description: productForm.description.trim() || null,
      image: productForm.image.trim() || null,
      stockQuantity,
      categoryId,
    };

    setIsSavingProduct(true);

    try {
      const response =
        formMode === "create"
          ? await adminProductsApi.createProduct(payload)
          : await adminProductsApi.updateProduct(editingProductId as number, payload);

      const dto = toProductDto(response);

      if (formMode === "create") {
        setProducts((previous) => [dto, ...previous]);
        setTotalSkuCount((previous) => previous + 1);
      } else {
        setProducts((previous) =>
          previous.map((product) => (product.id === dto.id ? dto : product))
        );
      }

      closeProductForm();
    } catch (saveError) {
      setFormError(isApiError(saveError) ? saveError.message : "Unable to save product.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || !isAdmin) {
      setProducts([]);
      setCategories([]);
      setOrdersWindow([]);
      setTotalSkuCount(0);
      setShowProductForm(false);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;

    const loadInventory = async () => {
      setLoading(true);
      setError(null);

      try {
        const [productsPage, ordersPage, categoriesData] = await Promise.all([
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
          categoriesApi.getAll(),
        ]);

        if (!active) {
          return;
        }

        setProducts(productsPage.content);
        setCategories(categoriesData);
        setOrdersWindow(ordersPage.content);
        setTotalSkuCount(productsPage.totalElements ?? productsPage.content.length);
        if (categoriesData.length > 0) {
          setProductForm((previous) =>
            previous.categoryId
              ? previous
              : { ...previous, categoryId: String(categoriesData[0].id) }
          );
        }
      } catch (loadError) {
        if (!active) {
          return;
        }

        setProducts([]);
        setCategories([]);
        setOrdersWindow([]);
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

    loadInventory();

    return () => {
      active = false;
    };
  }, [authLoading, isAdmin, user]);

  const categoryFilters = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((product) => toCategoryLabel(product.categoryName)))
    );

    return ["ALL", ...uniqueCategories];
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
                {actionError ? (
                  <div className="mb-4 rounded-[14px] border border-[#efd0cc] bg-[#fbefec] px-4 py-3 text-[13px] text-[#8f3d35]">
                    {actionError}
                  </div>
                ) : null}
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
                    onClick={openCreateProductForm}
                    disabled={categories.length === 0}
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
                        <article
                          key={product.id}
                          className="rounded-[18px] border border-[#ece5dc] bg-[#fdfcfa] overflow-visible"
                        >
                          <div className="relative h-[205px] overflow-hidden rounded-[22px] bg-[#ece7e1]">
                            <Image
                              src={image}
                              alt={product.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 25vw"
                              className="object-cover"
                            />
                          </div>

                          <div className="px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <p
                                className="line-clamp-2 text-[20px] leading-[1.1] text-[#2f2a26]"
                                style={{ fontFamily: "var(--font-noto-serif)" }}
                              >
                                {product.name}
                              </p>
                              <p className="mt-1 whitespace-nowrap text-[12px] text-[#62584f]">
                                {formatCurrency(product.price)}
                              </p>
                            </div>
                            <p className="mt-1 text-[11px] uppercase tracking-[1.1px] text-[#968c82]">
                              SKU: PRD-{String(product.id).padStart(3, "0")}
                            </p>
                          </div>

                          <div className="flex items-center border-t border-[#ece5dc] px-4 py-3">
                            <p className={`text-[12px] ${getStockStatusClassName(product.stockQuantity)}`}>
                              {stock > 0
                                ? `• ${String(stock).padStart(2, "0")} in stock`
                                : "• Out of stock"}
                            </p>
                            <div className="ml-auto relative z-30">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenActionProductId((current) =>
                                    current === product.id ? null : product.id
                                  )
                                }
                                className="inline-flex h-7 min-w-[22px] items-center justify-center text-[16px] leading-none text-[#7a726b] transition-colors hover:text-[#4f4841]"
                                aria-label="Product actions"
                              >
                                ...
                              </button>
                              {openActionProductId === product.id ? (
                                <div className="absolute right-0 top-[calc(100%+6px)] z-40 min-w-[130px] rounded-[10px] border border-[#e5ddd4] bg-white p-1 shadow-sm">
                                  <button
                                    type="button"
                                    onClick={() => void openEditProductForm(product.id)}
                                    className="w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[#5f564d] transition-colors hover:bg-[#f4efe9]"
                                  >
                                    Chỉnh sửa
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleDeleteProduct(product.id)}
                                    disabled={deletingProductId === product.id}
                                    className="w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[#9d4040] transition-colors hover:bg-[#fbefec] disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {deletingProductId === product.id ? "Đang xóa..." : "Xóa"}
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </section>

                {showProductForm ? (
                  <section className="mt-8 rounded-[16px] border border-[#e8e2d9] bg-[#fcfbf9] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h2
                        className="text-[28px] leading-none text-[#2d2a26]"
                        style={{ fontFamily: "var(--font-noto-serif)" }}
                      >
                        {formMode === "create" ? "Create Product" : "Edit Product"}
                      </h2>
                      <button
                        type="button"
                        onClick={closeProductForm}
                        className="rounded-full border border-[#d9d1c8] px-3 py-1.5 text-[11px] text-[#5f564d] transition-colors hover:bg-[#f4efe9]"
                      >
                        Close
                      </button>
                    </div>

                    {formError ? (
                      <div className="mt-4 rounded-[12px] border border-[#efd0cc] bg-[#fbefec] px-4 py-3 text-[13px] text-[#8f3d35]">
                        {formError}
                      </div>
                    ) : null}

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] text-[#7a726b]">Name</span>
                        <input
                          value={productForm.name}
                          onChange={(event) => handleProductFormChange("name", event.target.value)}
                          className="h-10 rounded-[10px] border border-[#ddd4ca] bg-white px-3 text-[13px] text-[#3d3731] outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] text-[#7a726b]">Price</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={productForm.price}
                          onChange={(event) => handleProductFormChange("price", event.target.value)}
                          className="h-10 rounded-[10px] border border-[#ddd4ca] bg-white px-3 text-[13px] text-[#3d3731] outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] text-[#7a726b]">Stock Quantity</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={productForm.stockQuantity}
                          onChange={(event) =>
                            handleProductFormChange("stockQuantity", event.target.value)
                          }
                          className="h-10 rounded-[10px] border border-[#ddd4ca] bg-white px-3 text-[13px] text-[#3d3731] outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] text-[#7a726b]">Category</span>
                        <select
                          value={productForm.categoryId}
                          onChange={(event) =>
                            handleProductFormChange("categoryId", event.target.value)
                          }
                          className="h-10 rounded-[10px] border border-[#ddd4ca] bg-white px-3 text-[13px] text-[#3d3731] outline-none"
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="flex flex-col gap-1 md:col-span-2">
                        <span className="text-[11px] text-[#7a726b]">Image URL</span>
                        <input
                          value={productForm.image}
                          onChange={(event) => handleProductFormChange("image", event.target.value)}
                          className="h-10 rounded-[10px] border border-[#ddd4ca] bg-white px-3 text-[13px] text-[#3d3731] outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-1 md:col-span-2">
                        <span className="text-[11px] text-[#7a726b]">Description</span>
                        <textarea
                          value={productForm.description}
                          onChange={(event) =>
                            handleProductFormChange("description", event.target.value)
                          }
                          rows={4}
                          className="rounded-[10px] border border-[#ddd4ca] bg-white px-3 py-2 text-[13px] text-[#3d3731] outline-none"
                        />
                      </label>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleSaveProduct()}
                        disabled={isSavingProduct}
                        className="inline-flex h-10 items-center justify-center rounded-full bg-[#8d6030] px-5 text-[12px] font-medium text-white transition-colors hover:bg-[#724e26] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSavingProduct
                          ? "Saving..."
                          : formMode === "create"
                            ? "Create Product"
                            : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={closeProductForm}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-[#d9d1c8] px-5 text-[12px] text-[#5f564d] transition-colors hover:bg-[#f4efe9]"
                      >
                        Cancel
                      </button>
                    </div>
                  </section>
                ) : null}

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
  );
}
