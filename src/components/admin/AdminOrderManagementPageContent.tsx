"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ClipboardList,
  Eye,
  LayoutDashboard,
  Package2,
  Search,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { adminOrdersApi, isApiError, productsApi } from "@/lib/api";
import type { OrderDTO, OrderPaymentMethod, ProductDTO } from "@/lib/api/types";
import { formatCurrency } from "@/lib/currency";
import { loadOrderProducts } from "@/lib/mappers";
import { Navbar } from "@/src/components/layout";
import { useAuth } from "@/src/contexts";

const FALLBACK_IMAGE = "/images/hero-main.png";
const ADMIN_ORDERS_CACHE_TTL_MS = 60_000;

let adminOrdersCache:
  | {
    expiresAt: number;
    orders: OrderDTO[];
    coverByOrderId: Record<number, string>;
  }
  | null = null;

type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "CANCELLED";
type OrderStatusValue = Exclude<StatusFilter, "ALL">;
type OrderItemFormState = { productId: string; quantity: string };
const ORDER_STATUS_VALUES: OrderStatusValue[] = ["PENDING", "CONFIRMED", "CANCELLED"];

const INITIAL_ORDER_ITEM: OrderItemFormState = {
  productId: "",
  quantity: "1",
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

function getStartOfWeek(baseDate: Date): Date {
  const date = new Date(baseDate);
  date.setHours(0, 0, 0, 0);
  const dayIndex = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - dayIndex);
  return date;
}

function calculateWeeklyGrowth(orders: OrderDTO[]): {
  growthPercent: number;
  thisWeekCount: number;
  lastWeekCount: number;
} {
  const now = new Date();
  const startOfThisWeek = getStartOfWeek(now);
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

  let thisWeekCount = 0;
  let lastWeekCount = 0;

  for (const order of orders) {
    if (order.status === "CANCELLED") {
      continue;
    }

    const createdAt = new Date(order.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      continue;
    }

    if (createdAt >= startOfThisWeek) {
      thisWeekCount += 1;
      continue;
    }

    if (createdAt >= startOfLastWeek && createdAt < startOfThisWeek) {
      lastWeekCount += 1;
    }
  }

  if (lastWeekCount === 0) {
    return {
      growthPercent: thisWeekCount > 0 ? 100 : 0,
      thisWeekCount,
      lastWeekCount,
    };
  }

  return {
    growthPercent: ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100,
    thisWeekCount,
    lastWeekCount,
  };
}

function formatCustomerLabel(userId: string): string {
  if (!userId) {
    return "Unknown";
  }

  if (userId.includes("@")) {
    const [namePart] = userId.split("@");
    return namePart
      .split(/[._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment[0].toUpperCase() + segment.slice(1))
      .join(" ");
  }

  if (userId.length <= 14) {
    return userId;
  }

  return `${userId.slice(0, 6)}...${userId.slice(-4)}`;
}

function formatOrderStatus(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "DELIVERED";
    case "PENDING":
      return "IN PROGRESS";
    case "CANCELLED":
      return "CANCELLED";
    default:
      return status;
  }
}

function getOrderStatusClassName(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "bg-[#dce8d2] text-[#3f6a33]";
    case "PENDING":
      return "bg-[#f3e7d5] text-[#8f6a2f]";
    case "CANCELLED":
      return "bg-[#f2dddb] text-[#9d4040]";
    default:
      return "bg-[#ece8e3] text-[#6f6861]";
  }
}

function getFormattedDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getFormattedDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function isOrderStatusValue(status: string): status is OrderStatusValue {
  return ORDER_STATUS_VALUES.includes(status as OrderStatusValue);
}

function isValidStatusTransition(current: OrderStatusValue, next: OrderStatusValue): boolean {
  if (current === next) {
    return true;
  }

  if (current === "CANCELLED") {
    return false;
  }

  if (current === "PENDING") {
    return next === "CONFIRMED" || next === "CANCELLED";
  }

  if (current === "CONFIRMED") {
    return next === "CANCELLED";
  }

  return false;
}

function CreateOrderModal({
  open,
  products,
  customerEmail,
  paymentMethod,
  items,
  submitting,
  submitError,
  onClose,
  onEmailChange,
  onPaymentMethodChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onSubmit,
}: {
  open: boolean;
  products: ProductDTO[];
  customerEmail: string;
  paymentMethod: OrderPaymentMethod;
  items: OrderItemFormState[];
  submitting: boolean;
  submitError: string | null;
  onClose: () => void;
  onEmailChange: (value: string) => void;
  onPaymentMethodChange: (value: OrderPaymentMethod) => void;
  onItemChange: (index: number, field: keyof OrderItemFormState, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onSubmit: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-[720px] rounded-[24px] border border-[#e7dfd5] bg-[#fbfaf8] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-[32px] leading-none text-[#2d2a26]"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              New Commission
            </h2>
            <p className="mt-2 text-[13px] text-[#7c736c]">
              Create an order directly for an existing customer email.
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
            Customer email
            <input
              value={customerEmail}
              onChange={(event) => onEmailChange(event.target.value)}
              className="h-11 rounded-[14px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
              placeholder="customer@example.com"
            />
          </label>

          <label className="grid gap-2 text-[12px] text-[#5f564d]">
            Payment method
            <select
              value={paymentMethod}
              onChange={(event) => onPaymentMethodChange(event.target.value as OrderPaymentMethod)}
              className="h-11 rounded-[14px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
            >
              <option value="COD">COD</option>
              <option value="VIETQR">VIETQR</option>
              <option value="SEPAY">SEPAY</option>
            </select>
          </label>
        </div>

        <div className="mt-6 space-y-3">
          {items.map((item, index) => (
            <div
              key={`${index}-${item.productId}`}
              className="grid gap-3 rounded-[18px] border border-[#ebe3d9] bg-white/80 p-4 md:grid-cols-[minmax(0,1fr)_120px_auto]"
            >
              <label className="grid gap-2 text-[12px] text-[#5f564d]">
                Product
                <select
                  value={item.productId}
                  onChange={(event) => onItemChange(index, "productId", event.target.value)}
                  className="h-11 rounded-[14px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
                >
                  <option value="">Choose product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.price)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-[12px] text-[#5f564d]">
                Quantity
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) => onItemChange(index, "quantity", event.target.value)}
                  className="h-11 rounded-[14px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
                />
              </label>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => onRemoveItem(index)}
                  disabled={items.length === 1}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#ddd2c6] px-4 text-[12px] font-medium text-[#6a5c4e] transition-colors hover:bg-[#f3eee8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between gap-3">
          <button
            type="button"
            onClick={onAddItem}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#ddd2c6] px-5 text-[12px] font-medium text-[#6a5c4e] transition-colors hover:bg-[#f3eee8]"
          >
            Add another item
          </button>
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
            {submitting ? "Creating..." : "Create order"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({
  open,
  order,
  coverImage,
  statusUpdateError,
  statusUpdating,
  onClose,
  onStatusChange,
}: {
  open: boolean;
  order: OrderDTO | null;
  coverImage: string;
  statusUpdateError: string | null;
  statusUpdating: boolean;
  onClose: () => void;
  onStatusChange: (order: OrderDTO, nextStatus: OrderStatusValue) => void;
}) {
  if (!open || !order) {
    return null;
  }

  const orderStatus = isOrderStatusValue(order.status) ? order.status : "PENDING";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-[760px] rounded-[24px] border border-[#e7dfd5] bg-[#fbfaf8] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-[32px] leading-none text-[#2d2a26]"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              Order #{order.id}
            </h2>
            <p className="mt-2 text-[13px] text-[#7c736c]">
              Created {getFormattedDateTime(order.createdAt)} by {formatCustomerLabel(order.userId)}
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

        <div className="mt-5 grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="relative h-[180px] overflow-hidden rounded-[16px] bg-[#f1ece7]">
            <Image src={coverImage} alt={`Order ${order.id}`} fill sizes="220px" className="object-cover" />
          </div>
          <div className="space-y-3">
            <div className="grid gap-2 text-[12px] text-[#5f564d] sm:grid-cols-2">
              <p>Customer ID: {order.userId}</p>
              <p>Payment: {order.paymentMethod}</p>
              <p>Total: {formatCurrency(order.totalAmount)}</p>
              <p>Status: {formatOrderStatus(order.status)}</p>
            </div>

            <div className="max-w-[220px]">
              <label className="mb-1 block text-[11px] uppercase tracking-[1.1px] text-[#8e857d]">
                Update status
              </label>
              <select
                value={orderStatus}
                disabled={statusUpdating}
                onChange={(event) => onStatusChange(order, event.target.value as OrderStatusValue)}
                className="h-9 w-full rounded-full border border-[#e5ddd4] bg-white px-3 text-[11px] text-[#6d6358] outline-none"
              >
                {ORDER_STATUS_VALUES.map((statusValue) => (
                  <option key={statusValue} value={statusValue}>
                    {formatOrderStatus(statusValue)}
                  </option>
                ))}
              </select>
            </div>

            {statusUpdateError ? (
              <p className="rounded-[12px] border border-[#efd0cc] bg-[#fbefec] px-3 py-2 text-[12px] text-[#8f3d35]">
                {statusUpdateError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[16px] border border-[#e8e2d9] bg-[#fcfbf9]">
          <div className="border-b border-[#ece6de] px-5 py-3">
            <h3
              className="text-[26px] leading-none text-[#2d2a26]"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              Items
            </h3>
          </div>
          <div className="max-h-[280px] overflow-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#f1ede8] text-left text-[10px] uppercase tracking-[1.2px] text-[#b4aaa0]">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-2 py-3 font-medium">Qty</th>
                  <th className="px-2 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr
                    key={`${order.id}-${item.id}`}
                    className="border-b border-[#f4f0eb] text-[13px] text-[#3d3731] last:border-none"
                  >
                    <td className="px-5 py-3">{item.productName}</td>
                    <td className="px-2 py-3">{item.quantity}</td>
                    <td className="px-2 py-3">{formatCurrency(item.price)}</td>
                    <td className="px-5 py-3 text-right">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminOrderManagementPageContent() {
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [availableProducts, setAvailableProducts] = useState<ProductDTO[]>([]);
  const [coverByOrderId, setCoverByOrderId] = useState<Record<number, string>>({});
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>("COD");
  const [orderItems, setOrderItems] = useState<OrderItemFormState[]>([INITIAL_ORDER_ITEM]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const mapLoadErrorMessage = (loadError: unknown): string => {
    if (isApiError(loadError)) {
      if (!loadError.status) {
        return "Cannot connect to backend. Please ensure BE is running on http://localhost:8080.";
      }
      return loadError.message;
    }

    return "Unable to load order management right now.";
  };

  const fetchOrdersWithCovers = async (): Promise<{
    orders: OrderDTO[];
    coverByOrderId: Record<number, string>;
  }> => {
    const ordersPage = await adminOrdersApi.getOrders({
      page: 0,
      size: 80,
      sortBy: "createdAt",
      sortDir: "DESC",
    });

    const ordersForCover = ordersPage.content.slice(0, 20);
    const firstItemProductIds = ordersForCover
      .map((order) => order.items[0]?.productId)
      .filter((value): value is number => typeof value === "number");
    const productsById =
      firstItemProductIds.length > 0 ? await loadOrderProducts(firstItemProductIds) : {};

    const coverByOrderId = Object.fromEntries(
      ordersForCover.map((order) => {
        const firstProductId = order.items[0]?.productId;
        const image =
          firstProductId && productsById[firstProductId]?.image
            ? productsById[firstProductId].image
            : FALLBACK_IMAGE;
        return [order.id, image];
      })
    );

    return {
      orders: ordersPage.content,
      coverByOrderId,
    };
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || !isAdmin) {
      setLoading(false);
      setOrders([]);
      setAvailableProducts([]);
      setCoverByOrderId({});
      setError(null);
      return;
    }

    let active = true;

    const loadInitialData = async () => {
      setLoading(true);
      setError(null);

      if (adminOrdersCache && adminOrdersCache.expiresAt > Date.now()) {
        setOrders(adminOrdersCache.orders);
        setCoverByOrderId(adminOrdersCache.coverByOrderId);
        setLoading(false);
      }

      try {
        const latestOrders = await fetchOrdersWithCovers();

        if (!active) {
          return;
        }

        setOrders(latestOrders.orders);
        setCoverByOrderId(latestOrders.coverByOrderId);
        adminOrdersCache = {
          expiresAt: Date.now() + ADMIN_ORDERS_CACHE_TTL_MS,
          orders: latestOrders.orders,
          coverByOrderId: latestOrders.coverByOrderId,
        };
        setLoading(false);

        try {
          const productsPage = await productsApi.search({
            page: 0,
            size: 100,
            sort: "id,desc",
          });

          if (!active) {
            return;
          }

          setAvailableProducts(productsPage.content);
        } catch (productLoadError) {
          if (!active) {
            return;
          }

          setAvailableProducts([]);
          setSubmitError(mapLoadErrorMessage(productLoadError));
        }
      } catch (loadError) {
        if (!active) {
          return;
        }

        setOrders([]);
        setAvailableProducts([]);
        setCoverByOrderId({});
        setError(mapLoadErrorMessage(loadError));
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
  }, [authLoading, isAdmin, user, reloadToken]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59.999`) : null;

    return orders.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== statusFilter) {
        return false;
      }

      const createdAt = new Date(order.createdAt);
      if (Number.isNaN(createdAt.getTime())) {
        return false;
      }

      if (start && createdAt < start) {
        return false;
      }

      if (end && createdAt > end) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const customerLabel = formatCustomerLabel(order.userId).toLowerCase();
      const itemNames = order.items.map((item) => item.productName.toLowerCase()).join(" ");
      const haystack = `${order.id} ${order.userId.toLowerCase()} ${customerLabel} ${itemNames}`;
      return haystack.includes(normalizedSearch);
    });
  }, [orders, statusFilter, searchTerm, startDate, endDate]);

  const visibleOrders = filteredOrders;
  const weeklyGrowth = useMemo(() => calculateWeeklyGrowth(orders), [orders]);

  const activeArrangements = useMemo(
    () => orders.filter((order) => order.status === "CONFIRMED").length,
    [orders]
  );
  const pendingArrangements = useMemo(
    () => orders.filter((order) => order.status === "PENDING").length,
    [orders]
  );
  const cancelledArrangements = useMemo(
    () => orders.filter((order) => order.status === "CANCELLED").length,
    [orders]
  );
  const detailOrder = useMemo(
    () => orders.find((order) => order.id === detailOrderId) ?? null,
    [detailOrderId, orders]
  );
  const dateRangeError = useMemo(() => {
    if (!startDate || !endDate) {
      return null;
    }
    return startDate > endDate ? "Start date cannot be later than end date." : null;
  }, [startDate, endDate]);

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCustomerEmail("");
    setPaymentMethod("COD");
    setOrderItems([INITIAL_ORDER_ITEM]);
    setSubmitError(null);
  };

  const updateOrderItem = (
    index: number,
    field: keyof OrderItemFormState,
    value: string
  ) => {
    setOrderItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
            ...item,
            [field]: value,
          }
          : item
      )
    );
  };

  const addOrderItem = () => {
    setOrderItems((current) => [...current, INITIAL_ORDER_ITEM]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const submitOrder = async () => {
    const items = orderItems.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
    }));

    if (!customerEmail.trim()) {
      setSubmitError("Please enter the customer's email.");
      return;
    }

    if (items.some((item) => !Number.isInteger(item.productId) || item.productId <= 0)) {
      setSubmitError("Please choose a valid product for each line item.");
      return;
    }

    if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity <= 0)) {
      setSubmitError("Each quantity must be 1 or greater.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await adminOrdersApi.createOrder({
        customerEmail: customerEmail.trim(),
        paymentMethod,
        items,
      });
      const latestOrders = await fetchOrdersWithCovers();
      setOrders(latestOrders.orders);
      setCoverByOrderId(latestOrders.coverByOrderId);
      adminOrdersCache = {
        expiresAt: Date.now() + ADMIN_ORDERS_CACHE_TTL_MS,
        orders: latestOrders.orders,
        coverByOrderId: latestOrders.coverByOrderId,
      };
      closeCreateModal();
    } catch (submitOrderError) {
      setSubmitError(mapLoadErrorMessage(submitOrderError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOrderInState = (updatedOrder: OrderDTO) => {
    setOrders((current) => {
      const nextOrders = current.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      );
      adminOrdersCache = {
        expiresAt: Date.now() + ADMIN_ORDERS_CACHE_TTL_MS,
        orders: nextOrders,
        coverByOrderId,
      };
      return nextOrders;
    });
  };

  const handleUpdateOrderStatus = async (order: OrderDTO, nextStatus: OrderStatusValue) => {
    setStatusUpdateError(null);

    if (!isOrderStatusValue(order.status)) {
      setStatusUpdateError("Current order status is invalid.");
      return;
    }

    if (!isValidStatusTransition(order.status, nextStatus)) {
      setStatusUpdateError(
        `Invalid status transition from ${order.status} to ${nextStatus}.`
      );
      return;
    }

    if (order.status === nextStatus) {
      return;
    }

    setUpdatingOrderId(order.id);

    try {
      const updatedOrder = await adminOrdersApi.updateOrderStatus(order.id, nextStatus);
      updateOrderInState(updatedOrder);
    } catch (statusError) {
      setStatusUpdateError(mapLoadErrorMessage(statusError));
    } finally {
      setUpdatingOrderId(null);
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
        title="Sign in to view admin orders"
        description="Order management is only available for authenticated administrators."
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
        description="Your account does not have permission to open order management."
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
      <CreateOrderModal
        open={isCreateModalOpen}
        products={availableProducts}
        customerEmail={customerEmail}
        paymentMethod={paymentMethod}
        items={orderItems}
        submitting={isSubmitting}
        submitError={submitError}
        onClose={closeCreateModal}
        onEmailChange={setCustomerEmail}
        onPaymentMethodChange={setPaymentMethod}
        onItemChange={updateOrderItem}
        onAddItem={addOrderItem}
        onRemoveItem={removeOrderItem}
        onSubmit={() => {
          void submitOrder();
        }}
      />

      <OrderDetailModal
        open={Boolean(detailOrder)}
        order={detailOrder}
        coverImage={detailOrder ? coverByOrderId[detailOrder.id] ?? FALLBACK_IMAGE : FALLBACK_IMAGE}
        statusUpdateError={statusUpdateError}
        statusUpdating={Boolean(detailOrder && updatingOrderId === detailOrder.id)}
        onClose={() => {
          setDetailOrderId(null);
          setStatusUpdateError(null);
        }}
        onStatusChange={(order, nextStatus) => {
          void handleUpdateOrderStatus(order, nextStatus);
        }}
      />

      <div className="min-h-screen bg-[#d8d4d4]">
        <Navbar />
        <div className="grid overflow-hidden border-t border-[#e9e3dc] bg-[#fbfaf8] md:grid-cols-[218px_minmax(0,1fr)]">
          <aside className="border-b border-[#eee8e1] px-4 py-6 md:min-h-[720px] md:border-b-0 md:border-r md:border-[#eee8e1] md:px-5">
            <nav className="space-y-2">
              {[
                { icon: LayoutDashboard, label: "Dashboard", href: "/admin", active: false },
                { icon: ClipboardList, label: "Orders", href: "/admin/orders", active: true },
                { icon: Package2, label: "Products", href: "/admin/products", active: false },
                { icon: Users, label: "Customers", href: "/admin/customers", active: false },
                { icon: Settings, label: "Settings", href: "/admin/settings", active: false },
              ].map((item) => {
                const className = `flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-[13px] transition-colors ${item.active
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
                <p className="text-[10px] uppercase tracking-[1.2px] text-[#b2aaa2]">Head Florist</p>
              </div>
            </div>
          </aside>

          <main className="px-4 py-7 md:px-7">
            {loading ? (
              <div className="grid gap-4">
                <div className="h-32 animate-pulse rounded-[18px] bg-[#f0ece7]" />
                <div className="h-64 animate-pulse rounded-[18px] bg-[#f0ece7]" />
              </div>
            ) : error ? (
              <div className="rounded-[18px] border border-[#efd0cc] bg-[#fbefec] px-5 py-4 text-[14px] text-[#8f3d35]">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => setReloadToken((current) => current + 1)}
                  className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-[#8d6030] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#724c25]"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h1
                      className="text-[48px] leading-[1.02] text-[#2d2a26]"
                      style={{ fontFamily: "var(--font-noto-serif)" }}
                    >
                      Order Boutique
                    </h1>
                    <p className="mt-1 text-[14px] italic text-[#7f756d]">
                      The Atelier Curator
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitError(null);
                        setIsCreateModalOpen(true);
                      }}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-[#8d6030] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#724c25]"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      + New Commission
                    </button>
                  </div>
                </div>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <article className="rounded-[14px] border border-[#ece5dc] bg-[#fdfcfa] px-5 py-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[1.6px] text-[#8f867e]">
                      TOTAL ORDERS
                    </p>
                    <p
                      className="mt-1 text-[46px] leading-none text-[#2e2924]"
                      style={{ fontFamily: "var(--font-noto-serif)" }}
                    >
                      {String(orders.length).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-[12px] text-[#756c64]">All loaded records</p>
                  </article>

                  <article className="rounded-[14px] border border-[#ece5dc] bg-[#fdfcfa] px-5 py-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[1.6px] text-[#8f867e]">
                      IN PROGRESS
                    </p>
                    <p
                      className="mt-1 text-[46px] leading-none text-[#2e2924]"
                      style={{ fontFamily: "var(--font-noto-serif)" }}
                    >
                      {String(pendingArrangements).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-[12px] text-[#756c64]">Pending confirmation</p>
                  </article>

                  <article className="rounded-[14px] border border-[#cfe2c7] bg-[#d8ead0] px-5 py-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[1.6px] text-[#4e6642]">
                      DELIVERED
                    </p>
                    <p
                      className="mt-1 text-[46px] leading-none text-[#32492a]"
                      style={{ fontFamily: "var(--font-noto-serif)" }}
                    >
                      {String(activeArrangements).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-[12px] text-[#516949]">Confirmed orders</p>
                  </article>

                  <article className="rounded-[14px] border border-[#ecd5d3] bg-[#f7e8e6] px-5 py-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[1.6px] text-[#8a4c46]">
                      CANCELLED
                    </p>
                    <p
                      className="mt-1 text-[46px] leading-none text-[#8a4c46]"
                      style={{ fontFamily: "var(--font-noto-serif)" }}
                    >
                      {String(cancelledArrangements).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-[12px] text-[#8a4c46]">No longer active</p>
                  </article>
                </section>

                <section className="overflow-hidden rounded-[16px] border border-[#e8e2d9] bg-[#fcfbf9]">
                  <div className="border-b border-[#ece6de] px-5 py-4">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <h2
                        className="text-[32px] leading-none text-[#2d2a26]"
                        style={{ fontFamily: "var(--font-noto-serif)" }}
                      >
                        Order List
                      </h2>
                      <p className="text-[12px] text-[#7f756d]">
                        {weeklyGrowth.growthPercent >= 0 ? "+" : ""}
                        {Math.round(weeklyGrowth.growthPercent)}% vs last week
                      </p>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                        className="h-9 rounded-full border border-[#e5ddd4] bg-white px-3 text-[11px] text-[#6d6358] outline-none"
                      >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">In Progress</option>
                        <option value="CONFIRMED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        className="h-9 rounded-full border border-[#e5ddd4] bg-white px-3 text-[11px] text-[#6d6358] outline-none"
                      />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        className="h-9 rounded-full border border-[#e5ddd4] bg-white px-3 text-[11px] text-[#6d6358] outline-none"
                      />
                      <div className="flex h-9 items-center rounded-full border border-[#e5ddd4] bg-white px-3">
                        <Search className="h-3.5 w-3.5 text-[#9c9188]" />
                        <input
                          value={searchTerm}
                          onChange={(event) => setSearchTerm(event.target.value)}
                          placeholder="Search by order id, customer, product..."
                          className="ml-2 w-full bg-transparent text-[11px] text-[#6d6358] outline-none placeholder:text-[#b1a79f]"
                        />
                      </div>
                    </div>
                  </div>

                  {dateRangeError ? (
                    <div className="border-b border-[#ece6de] bg-[#fbefec] px-5 py-3 text-[12px] text-[#8f3d35]">
                      {dateRangeError}
                    </div>
                  ) : null}

                  {statusUpdateError ? (
                    <div className="border-b border-[#ece6de] bg-[#fbefec] px-5 py-3 text-[12px] text-[#8f3d35]">
                      {statusUpdateError}
                    </div>
                  ) : null}

                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-[#f1ede8] text-left text-[10px] uppercase tracking-[1.2px] text-[#b4aaa0]">
                          <th className="px-5 py-3 font-medium">Arrangement</th>
                          <th className="px-2 py-3 font-medium">Recipient</th>
                          <th className="px-2 py-3 font-medium">Created</th>
                          <th className="px-2 py-3 font-medium">Status</th>
                          <th className="px-2 py-3 text-right font-medium">Value</th>
                          <th className="px-5 py-3 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleOrders.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-5 py-8 text-center text-[13px] text-[#8f877f]"
                            >
                              No commissions match the selected filters.
                            </td>
                          </tr>
                        ) : (
                          visibleOrders.map((order) => {
                            const firstItem = order.items[0];
                            const itemSummary = `${order.items.length} arrangement${order.items.length > 1 ? "s" : ""
                              }`;
                            const orderStatus = isOrderStatusValue(order.status)
                              ? order.status
                              : "PENDING";

                            return (
                              <tr
                                key={order.id}
                                className="border-b border-[#f4f0eb] text-[13px] text-[#3d3731] last:border-none"
                              >
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="relative h-11 w-11 overflow-hidden rounded-[8px] bg-[#f3efe9]">
                                      <Image
                                        src={coverByOrderId[order.id] ?? FALLBACK_IMAGE}
                                        alt={firstItem?.productName ?? `Order ${order.id}`}
                                        fill
                                        sizes="44px"
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="max-w-[220px]">
                                      <p className="line-clamp-1 text-[13px] font-medium text-[#3d3731]">
                                        {firstItem?.productName ?? `Order #${order.id}`}
                                      </p>
                                      <p className="text-[10px] text-[#9a9087]">{itemSummary}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-2 py-3 text-[#5f564d]">
                                  {formatCustomerLabel(order.userId)}
                                </td>
                                <td className="px-2 py-3 text-[#5f564d]">
                                  {getFormattedDate(order.createdAt)}
                                </td>
                                <td className="px-2 py-3">
                                  <select
                                    value={orderStatus}
                                    disabled={updatingOrderId === order.id}
                                    onChange={(event) => {
                                      void handleUpdateOrderStatus(
                                        order,
                                        event.target.value as OrderStatusValue
                                      );
                                    }}
                                    className={`h-8 rounded-full border px-3 text-[10px] font-semibold tracking-[0.8px] outline-none ${getOrderStatusClassName(order.status)} ${updatingOrderId === order.id
                                        ? "cursor-not-allowed opacity-70"
                                        : ""
                                      }`}
                                  >
                                    {ORDER_STATUS_VALUES.map((statusValue) => (
                                      <option
                                        key={statusValue}
                                        value={statusValue}
                                        disabled={!isValidStatusTransition(orderStatus, statusValue)}
                                      >
                                        {formatOrderStatus(statusValue)}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-2 py-3 text-right font-medium">
                                  {formatCurrency(order.totalAmount)}
                                </td>
                                <td className="px-5 py-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setStatusUpdateError(null);
                                      setDetailOrderId(order.id);
                                    }}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#ddd2c6] px-3 text-[11px] text-[#6d6358] transition-colors hover:bg-[#f3eee8]"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    Detail
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-[#ece6de] px-5 py-4 text-[12px] text-[#7b6f62]">
                    Showing {visibleOrders.length} of {orders.length} orders
                  </div>
                </section>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
