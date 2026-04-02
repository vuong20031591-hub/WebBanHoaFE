import { Product } from "@/lib/products";
import { CartVariantItem } from "./types";

interface CreateCartItemOptions {
  deliveryDate?: string;
  giftNote?: string;
  quantity?: number;
  ribbon?: string;
  size?: CartVariantItem["size"];
  availableStock?: number | null;
}

export function createCartItem(
  product: Product,
  options: CreateCartItemOptions = {}
): Omit<CartVariantItem, "localId"> {
  const requestedQuantity = options.quantity ?? 1;
  const availableStock = options.availableStock ?? null;
  
  // Clamp to stock if known
  const quantity = availableStock !== null 
    ? Math.min(requestedQuantity, availableStock)
    : requestedQuantity;

  return {
    productId: product.id,
    productName: product.name,
    productImage: product.image,
    price: product.price,
    quantity,
    availableStock,
    size: options.size ?? "deluxe",
    deliveryDate: options.deliveryDate,
    giftNote: options.giftNote,
    ribbon: options.ribbon,
  };
}

export function generateUUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function groupByProductId(variants: CartVariantItem[]): Record<number, CartVariantItem[]> {
  return variants.reduce((acc, variant) => {
    if (!acc[variant.productId]) {
      acc[variant.productId] = [];
    }
    acc[variant.productId].push(variant);
    return acc;
  }, {} as Record<number, CartVariantItem[]>);
}

export function sumQuantities(variants: CartVariantItem[]): number {
  return variants.reduce((sum, v) => sum + v.quantity, 0);
}

export function getVariantsByProductId(variants: CartVariantItem[], productId: number): CartVariantItem[] {
  return variants.filter(v => v.productId === productId);
}
