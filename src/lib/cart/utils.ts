import { Product } from "@/lib/products";
import { CartItem } from "./types";

interface CreateCartItemOptions {
  deliveryDate?: string;
  giftNote?: string;
  quantity?: number;
  ribbon?: string;
  size?: CartItem["size"];
}

export function createCartItem(
  product: Product,
  options: CreateCartItemOptions = {}
): CartItem {
  return {
    productId: product.id,
    productName: product.name,
    productImage: product.image,
    price: product.price,
    quantity: options.quantity ?? 1,
    size: options.size ?? "deluxe",
    deliveryDate: options.deliveryDate,
    giftNote: options.giftNote,
    ribbon: options.ribbon,
  };
}
