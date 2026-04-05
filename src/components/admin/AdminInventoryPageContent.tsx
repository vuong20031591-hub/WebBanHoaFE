"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ClipboardList,
  Eye,
  LayoutDashboard,
  MoreHorizontal,
  Package2,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { adminOrdersApi, adminProductsApi, categoriesApi, isApiError, productsApi } from "@/lib/api";
import type {
  AdminProductUpsertRequest,
  CategoryDTO,
  OrderDTO,
  ProductDTO,
  ProductDetailDTO,
} from "@/lib/api/types";
import { formatCurrency } from "@/lib/currency";
import { resolveProductImage } from "@/lib/mappers/product";
import { Navbar } from "@/src/components/layout";
import { useAuth } from "@/src/contexts";

const LOW_STOCK_THRESHOLD = 15;
const PRODUCT_PAGE_SIZE = 120;
const ORDER_PAGE_SIZE = 30;
const PRODUCT_GRID_PAGE_SIZE = 8;

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

type RecentlyDeletedProduct = {
  id: number;
  name: string;
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

function formatProductDetailDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toProductFormState(product: ProductDetailDTO): ProductFormState {
  return {
    name: product.name,
    price: String(product.price),
    description: product.description ?? "",
    image: product.image ?? "",
    stockQuantity: String(normalizeStock(product.stockQuantity)),
    categoryId: String(product.categoryId),
  };
}

function ProductCreateModal({
  mode,
  open,
  categories,
  form,
  submitError,
  submitting,
  onClose,
  onChange,
  onSubmit,
}: {
  mode: "create" | "edit";
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

  const title = mode === "create" ? "New Botanical Element" : "Edit Botanical Element";
  const subtitle =
    mode === "create"
      ? "Create a new product and publish it to both admin inventory and storefront."
      : "Update product information and keep storefront inventory in sync.";
  const submitLabel = mode === "create" ? "Create product" : "Save changes";
  const submittingLabel = mode === "create" ? "Creating..." : "Saving...";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-[620px] rounded-[24px] border border-[#e7dfd5] bg-[#fbfaf8] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-[32px] leading-none text-[#2d2a26]"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              {title}
            </h2>
            <p className="mt-2 text-[13px] text-[#7c736c]">{subtitle}</p>
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
            {submitting ? submittingLabel : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductDetailModal({
  open,
  product,
  loading,
  error,
  stockDraft,
  stockSubmitting,
  onClose,
  onEdit,
  onStockDraftChange,
  onStockSubmit,
}: {
  open: boolean;
  product: ProductDetailDTO | null;
  loading: boolean;
  error: string | null;
  stockDraft: string;
  stockSubmitting: boolean;
  onClose: () => void;
  onEdit: () => void;
  onStockDraftChange: (value: string) => void;
  onStockSubmit: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-[760px] rounded-[24px] border border-[#e7dfd5] bg-[#fbfaf8] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h2
            className="text-[32px] leading-none text-[#2d2a26]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            Product Detail
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2ede8] text-[#6e655d] transition-colors hover:bg-[#e7e0d8]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="h-48 animate-pulse rounded-[18px] bg-[#ece8e3]" />
          ) : error ? (
            <div className="rounded-[16px] border border-[#efd0cc] bg-[#fbefec] px-4 py-3 text-[13px] text-[#8f3d35]">
              {error}
            </div>
          ) : !product ? (
            <div className="rounded-[16px] border border-[#ece5dc] bg-[#fdfcfa] px-4 py-3 text-[13px] text-[#7b726a]">
              Product detail is unavailable.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-[260px_minmax(0,1fr)]">
              <div className="relative h-[230px] overflow-hidden rounded-[18px] bg-[#ece7e1]">
                <Image
                  src={resolveProductImage(product.image)}
                  alt={product.name}
                  fill
                  sizes="260px"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p
                      className="text-[28px] leading-[1.1] text-[#2f2a26]"
                      style={{ fontFamily: "var(--font-noto-serif)" }}
                    >
                      {product.name}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[1.1px] text-[#968c82]">
                      Product ID: {product.id}
                    </p>
                  </div>
                  <p className="mt-1 text-[14px] text-[#62584f]">{formatCurrency(product.price)}</p>
                </div>

                <div className="mt-3 space-y-1 text-[12px] text-[#5f564d]">
                  <p>Category: {toCategoryLabel(product.categoryName)}</p>
                  <p>
                    Stock: {normalizeStock(product.stockQuantity)} ({getStockStatusLabel(product.stockQuantity)})
                  </p>
                  <p>Created: {formatProductDetailDate(product.createdAt)}</p>
                  <p>Updated: {formatProductDetailDate(product.updatedAt)}</p>
                </div>

                <p className="mt-4 rounded-[14px] border border-[#ece5dc] bg-white/70 px-4 py-3 text-[13px] text-[#5f564d]">
                  {product.description?.trim() ? product.description : "No description provided."}
                </p>

                <div className="mt-4 flex flex-wrap items-end gap-2">
                  <input
                    type="number"
                    min="0"
                    value={stockDraft}
                    onChange={(event) => onStockDraftChange(event.target.value)}
                    className="h-10 w-[120px] rounded-[12px] border border-[#e4ddd4] bg-white px-3 text-[11px] text-[#5f564d] outline-none transition-colors focus:border-[#8d6030]"
                  />
                  <button
                    type="button"
                    onClick={onStockSubmit}
                    disabled={stockSubmitting}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-[#8d6030] px-4 text-[11px] font-medium text-white transition-colors hover:bg-[#724e26] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {stockSubmitting ? "Updating..." : "Update stock"}
                  </button>
                  <button
                    type="button"
                    onClick={onEdit}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-[#ddd2c6] px-4 text-[11px] font-medium text-[#6a5c4e] transition-colors hover:bg-[#f3eee8]"
                  >
                    Edit product
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmDialog({
  open,
  product,
  deleting,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean;
  product: ProductDTO | null;
  deleting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open || !product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-[520px] rounded-[24px] border border-[#e7dfd5] bg-[#fbfaf8] p-6 shadow-2xl">
        <h2
          className="text-[30px] leading-none text-[#2d2a26]"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          Delete Product
        </h2>
        <p className="mt-3 text-[13px] text-[#7c736c]">
          This will soft-delete <span className="font-medium text-[#5f564d]">{product.name}</span>.
        </p>

        {error ? (
          <div className="mt-4 rounded-[16px] border border-[#efd0cc] bg-[#fbefec] px-4 py-3 text-[13px] text-[#8f3d35]">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#ddd2c6] px-5 text-[12px] font-medium text-[#6a5c4e] transition-colors hover:bg-[#f3eee8]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#b24343] px-5 text-[12px] font-medium text-white transition-colors hover:bg-[#983838] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Confirm delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminInventoryPageContent() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [ordersWindow, setOrdersWindow] = useState<OrderDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [totalSkuCount, setTotalSkuCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [productForm, setProductForm] = useState<ProductFormState>(INITIAL_PRODUCT_FORM);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editLoadingProductId, setEditLoadingProductId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailProductId, setDetailProductId] = useState<number | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductDetailDTO | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailStockDraft, setDetailStockDraft] = useState("0");
  const [isDetailStockSubmitting, setIsDetailStockSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [recentlyDeletedProducts, setRecentlyDeletedProducts] = useState<RecentlyDeletedProduct[]>(
    []
  );
  const [restoringProductId, setRestoringProductId] = useState<number | null>(null);
  const [openActionMenuProductId, setOpenActionMenuProductId] = useState<number | null>(null);
  const [currentProductPage, setCurrentProductPage] = useState(1);

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const mapApiMessage = (value: unknown, fallback: string): string => {
    if (isApiError(value)) {
      return value.message;
    }

    return fallback;
  };

  const toProductListItem = (detail: ProductDetailDTO): ProductDTO => ({
    id: detail.id,
    name: detail.name,
    price: detail.price,
    description: detail.description,
    imageUrl: detail.image,
    stockQuantity: detail.stockQuantity,
    categoryName: detail.categoryName,
  });

  const syncProductsState = (updater: (current: ProductDTO[]) => ProductDTO[]) => {
    setProducts((current) => {
      const next = updater(current);
      setTotalSkuCount(next.length);
      return next;
    });
  };

  const upsertProductInState = (detail: ProductDetailDTO) => {
    const nextProduct = toProductListItem(detail);
    syncProductsState((current) => {
      const foundIndex = current.findIndex((product) => product.id === nextProduct.id);
      if (foundIndex === -1) {
        return [nextProduct, ...current];
      }

      return current.map((product, index) => (index === foundIndex ? nextProduct : product));
    });
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
        setError(mapApiMessage(loadError, "Unable to load inventory data right now."));
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

  const totalProductPages = useMemo(
    () => Math.max(1, Math.ceil(filteredProducts.length / PRODUCT_GRID_PAGE_SIZE)),
    [filteredProducts.length]
  );

  useEffect(() => {
    setCurrentProductPage(1);
  }, [activeCategory]);

  useEffect(() => {
    if (currentProductPage > totalProductPages) {
      setCurrentProductPage(totalProductPages);
    }
  }, [currentProductPage, totalProductPages]);

  useEffect(() => {
    setOpenActionMenuProductId(null);
  }, [activeCategory, currentProductPage]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentProductPage - 1) * PRODUCT_GRID_PAGE_SIZE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCT_GRID_PAGE_SIZE);
  }, [currentProductPage, filteredProducts]);

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
    setModalMode("create");
    setEditingProductId(null);
    setProductForm(INITIAL_PRODUCT_FORM);
    setSubmitError(null);
  };

  const openCreateModal = () => {
    setActionError(null);
    setSubmitError(null);
    setModalMode("create");
    setEditingProductId(null);
    setProductForm(INITIAL_PRODUCT_FORM);
    setIsCreateModalOpen(true);
  };

  const openDetailModal = async (productId: number) => {
    setOpenActionMenuProductId(null);
    setIsDetailModalOpen(true);
    setDetailProductId(productId);
    setIsDetailLoading(true);
    setDetailError(null);
    setActionError(null);

    try {
      const detail = await productsApi.getById(productId);
      setDetailProduct(detail);
      setDetailStockDraft(String(normalizeStock(detail.stockQuantity)));
    } catch (detailLoadError) {
      setDetailProduct(null);
      setDetailError(mapApiMessage(detailLoadError, "Unable to load product detail right now."));
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setDetailProductId(null);
    setDetailProduct(null);
    setDetailError(null);
    setDetailStockDraft("0");
  };

  const startEditProduct = async (productId: number) => {
    setOpenActionMenuProductId(null);
    setActionError(null);
    setSubmitError(null);
    setEditLoadingProductId(productId);

    try {
      const detail =
        detailProductId === productId && detailProduct
          ? detailProduct
          : await productsApi.getById(productId);
      setModalMode("edit");
      setEditingProductId(productId);
      setProductForm(toProductFormState(detail));
      setIsCreateModalOpen(true);
    } catch (editLoadError) {
      setActionError(mapApiMessage(editLoadError, "Unable to open edit form right now."));
    } finally {
      setEditLoadingProductId(null);
    }
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

    if (modalMode === "edit" && editingProductId === null) {
      setSubmitError("Cannot update product because product id is missing.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setActionError(null);

    try {
      const savedProduct =
        modalMode === "create"
          ? await adminProductsApi.createProduct(payload)
          : await adminProductsApi.updateProduct(editingProductId as number, payload);
      upsertProductInState(savedProduct);

      if (detailProductId === savedProduct.id) {
        setDetailProduct(savedProduct);
        setDetailStockDraft(String(normalizeStock(savedProduct.stockQuantity)));
        setDetailError(null);
      }

      closeCreateModal();
    } catch (submitProductError) {
      setSubmitError(mapApiMessage(submitProductError, "Unable to save product right now."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    setActionError(null);

    try {
      await adminProductsApi.deleteProduct(deleteTarget.id);
      setRecentlyDeletedProducts((current) =>
        [{ id: deleteTarget.id, name: deleteTarget.name }, ...current.filter((item) => item.id !== deleteTarget.id)].slice(
          0,
          6
        )
      );
      syncProductsState((current) => current.filter((product) => product.id !== deleteTarget.id));

      if (detailProductId === deleteTarget.id) {
        closeDetailModal();
      }

      setOpenActionMenuProductId(null);
      setDeleteTarget(null);
    } catch (deleteProductError) {
      setDeleteError(mapApiMessage(deleteProductError, "Unable to delete product right now."));
    } finally {
      setIsDeleting(false);
    }
  };

  const restoreProduct = async (product: RecentlyDeletedProduct) => {
    setRestoringProductId(product.id);
    setActionError(null);

    try {
      const restoredProduct = await adminProductsApi.restoreProduct(product.id);
      upsertProductInState(restoredProduct);
      setRecentlyDeletedProducts((current) => current.filter((item) => item.id !== product.id));
    } catch (restoreError) {
      setActionError(mapApiMessage(restoreError, "Unable to restore product right now."));
    } finally {
      setRestoringProductId(null);
    }
  };

  const submitDetailStock = async () => {
    if (!detailProduct) {
      return;
    }

    const stock = Number(detailStockDraft);

    if (!Number.isInteger(stock) || stock < 0) {
      setDetailError("Stock quantity must be a whole number and cannot be negative.");
      return;
    }

    setIsDetailStockSubmitting(true);
    setDetailError(null);
    setActionError(null);

    try {
      const updated = await adminProductsApi.updateStock(detailProduct.id, stock);
      setDetailProduct(updated);
      setDetailStockDraft(String(normalizeStock(updated.stockQuantity)));
      upsertProductInState(updated);
    } catch (stockError) {
      setDetailError(mapApiMessage(stockError, "Unable to update stock right now."));
    } finally {
      setIsDetailStockSubmitting(false);
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

  const visibleRangeStart =
    filteredProducts.length === 0 ? 0 : (currentProductPage - 1) * PRODUCT_GRID_PAGE_SIZE + 1;
  const visibleRangeEnd = Math.min(currentProductPage * PRODUCT_GRID_PAGE_SIZE, filteredProducts.length);

  return (
    <>
      <ProductCreateModal
        mode={modalMode}
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

      <ProductDetailModal
        open={isDetailModalOpen}
        product={detailProduct}
        loading={isDetailLoading}
        error={detailError}
        stockDraft={detailStockDraft}
        stockSubmitting={isDetailStockSubmitting}
        onClose={closeDetailModal}
        onEdit={() => {
          if (detailProduct) {
            void startEditProduct(detailProduct.id);
          }
        }}
        onStockDraftChange={setDetailStockDraft}
        onStockSubmit={() => {
          void submitDetailStock();
        }}
      />

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        product={deleteTarget}
        deleting={isDeleting}
        error={deleteError}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={() => {
          void confirmDeleteProduct();
        }}
      />

      <div className="min-h-screen bg-[#d8d4d4]">
        <Navbar />
        <div className="grid overflow-hidden border-t border-[#e9e3dc] bg-[#fbfaf8] md:grid-cols-[218px_minmax(0,1fr)]">
          <aside className="border-b border-[#eee8e1] px-4 py-6 md:min-h-[720px] md:border-b-0 md:border-r md:border-[#eee8e1] md:px-5">
            <nav className="space-y-2">
              {[
                { icon: LayoutDashboard, label: "Dashboard", href: "/admin", active: false },
                { icon: ClipboardList, label: "Orders", href: "/admin/orders", active: false },
                { icon: Package2, label: "Products", href: "/admin/products", active: true },
                { icon: Users, label: "Customers", href: "/admin/customers", active: false },
                { icon: Settings, label: "Settings", href: "/admin/settings", active: false },
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
                  <div className="ml-auto flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={openCreateModal}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8d6030] px-4 py-2 text-[11px] font-medium text-white transition-colors hover:bg-[#724e26]"
                    >
                      <Plus className="h-3 w-3" />
                      New Botanical Element
                    </button>
                  </div>
                </section>

                {actionError ? (
                  <div className="mt-4 rounded-[16px] border border-[#efd0cc] bg-[#fbefec] px-4 py-3 text-[13px] text-[#8f3d35]">
                    {actionError}
                  </div>
                ) : null}

                {recentlyDeletedProducts.length > 0 ? (
                  <section className="mt-4 rounded-[14px] border border-[#ece5dc] bg-[#fdfcfa] px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[1.1px] text-[#8f877f]">
                      Recently deleted
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {recentlyDeletedProducts.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            void restoreProduct(item);
                          }}
                          disabled={restoringProductId === item.id}
                          className="inline-flex items-center gap-2 rounded-full border border-[#ddd2c6] bg-white px-3 py-1.5 text-[11px] text-[#6a5c4e] transition-colors hover:bg-[#f3eee8] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <RefreshCw className="h-3 w-3" />
                          {restoringProductId === item.id ? "Restoring..." : `Restore ${item.name}`}
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section
                  className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  onClick={() => setOpenActionMenuProductId(null)}
                >
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-full rounded-[14px] border border-[#ece5dc] bg-[#fdfcfa] px-5 py-6 text-[13px] text-[#7a726b]">
                      No products found for this filter combination.
                    </div>
                  ) : (
                    paginatedProducts.map((product) => {
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
                          <p className="mt-1 text-[10px] uppercase tracking-[1px] text-[#9e948a]">
                            {toCategoryLabel(product.categoryName)}
                          </p>
                          <div className="relative mt-2 flex items-center justify-between">
                            <p className={`text-[11px] ${getStockStatusClassName(product.stockQuantity)}`}>
                              • {stock} in stock
                            </p>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setOpenActionMenuProductId((current) =>
                                  current === product.id ? null : product.id
                                );
                              }}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#6c635b] transition-colors hover:bg-[#f1ece7]"
                              aria-label={`Open actions for ${product.name}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>

                            {openActionMenuProductId === product.id ? (
                              <div
                                className="absolute right-0 top-[calc(100%+6px)] z-10 w-[154px] rounded-[12px] border border-[#e5ddd4] bg-[#fcfaf7] p-1 shadow-sm"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionMenuProductId(null);
                                    void openDetailModal(product.id);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[11px] text-[#5b4f43] transition-colors hover:bg-[#f1eeea]"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Detail
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionMenuProductId(null);
                                    void startEditProduct(product.id);
                                  }}
                                  disabled={editLoadingProductId === product.id}
                                  className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[11px] text-[#5b4f43] transition-colors hover:bg-[#f1eeea] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  {editLoadingProductId === product.id ? "Loading..." : "Edit"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionMenuProductId(null);
                                    setDeleteTarget(product);
                                    setDeleteError(null);
                                    setActionError(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[11px] text-[#9b4740] transition-colors hover:bg-[#faefed]"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </article>
                      );
                    })
                  )}
                </section>

                {filteredProducts.length > 0 ? (
                  <section className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#ece5dc] bg-[#fdfcfa] px-4 py-3">
                    <p className="text-[11px] text-[#7a726b]">
                      Showing {visibleRangeStart}-{visibleRangeEnd} of {filteredProducts.length} products
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentProductPage((current) => Math.max(1, current - 1))}
                        disabled={currentProductPage <= 1}
                        className="inline-flex h-8 items-center justify-center rounded-full border border-[#ddd2c6] px-3 text-[11px] text-[#6a5c4e] transition-colors hover:bg-[#f3eee8] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="text-[11px] text-[#7a726b]">
                        Page {currentProductPage}/{totalProductPages}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentProductPage((current) => Math.min(totalProductPages, current + 1))
                        }
                        disabled={currentProductPage >= totalProductPages}
                        className="inline-flex h-8 items-center justify-center rounded-full border border-[#ddd2c6] px-3 text-[11px] text-[#6a5c4e] transition-colors hover:bg-[#f3eee8] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
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
    </>
  );
}
