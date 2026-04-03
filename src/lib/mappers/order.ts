import { productsApi } from "../api/products";
import { OrderDTO, OrderItemDTO, OrderPaymentMethod } from "../api/types";
import { ProfileOrder } from "../profile/types";
import { Product } from "../products/types";
import {
  DEFAULT_PRODUCT_IMAGE,
  mapProductDetailDTOToProduct,
  resolveProductImage,
} from "./product";

export interface OrderDisplayItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  image: string;
}

export function formatOrderDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatOrderStatus(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "Confirmed";
    case "CANCELLED":
      return "Cancelled";
    case "PENDING":
      return "Pending";
    default:
      return status;
  }
}

export function formatPaymentMethod(method: OrderPaymentMethod): string {
  switch (method) {
    case "COD":
      return "Cash on delivery";
    case "SEPAY":
      return "SePay";
    case "VIETQR":
      return "VietQR";
    default:
      return method;
  }
}

export async function loadOrderProducts(
  productIds: number[]
): Promise<Record<number, Product>> {
  const uniqueIds = [...new Set(productIds)];
  const results = await Promise.all(
    uniqueIds.map(async (productId) => {
      try {
        const dto = await productsApi.getById(productId);
        return [productId, mapProductDetailDTOToProduct(dto)] as const;
      } catch {
        return null;
      }
    })
  );

  return Object.fromEntries(
    results.filter((entry): entry is readonly [number, Product] => entry !== null)
  );
}

export function mapOrderItemToDisplay(
  item: OrderItemDTO,
  product?: Product
): OrderDisplayItem {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.subtotal,
    image: resolveProductImage(product?.image ?? DEFAULT_PRODUCT_IMAGE),
  };
}

export function mapOrderToProfileOrder(
  order: OrderDTO,
  productsById: Record<number, Product>
): ProfileOrder {
  const firstItem = order.items[0];
  const image = firstItem
    ? resolveProductImage(productsById[firstItem.productId]?.image ?? DEFAULT_PRODUCT_IMAGE)
    : DEFAULT_PRODUCT_IMAGE;
  const extraItemsCount = Math.max(0, order.items.length - 1);
  const title = firstItem
    ? extraItemsCount > 0
      ? `${firstItem.productName} + ${extraItemsCount} more items`
      : firstItem.productName
    : `Order #${order.id}`;
  const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: String(order.id),
    status: formatOrderStatus(order.status),
    date: formatOrderDate(order.createdAt),
    title,
    description: `${quantity} items - ${formatPaymentMethod(order.paymentMethod)}`,
    price: order.totalAmount,
    image,
    href: `/checkout/tracking?orderId=${order.id}`,
  };
}
