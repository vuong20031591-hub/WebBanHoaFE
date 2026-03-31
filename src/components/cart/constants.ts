import { CartItem, CartNote } from "@/lib/cart";

export interface CartRecommendation {
  id: number;
  href: string;
  image: string;
  name: string;
  price: number;
}

const SIZE_LABELS: Record<CartItem["size"], string> = {
  classic: "Classic Arrangement",
  deluxe: "Standard Arrangement",
  grand: "Large Vase Included",
};

export const SHIPPING_FEE = 12.5;

export const PREVIEW_NOTE: CartNote = {
  message:
    "To my dearest, may these blooms\nbrighten your day as much as you\nbrighten mine.",
  signature: "With love, Julian.",
};

export const CART_RECOMMENDATIONS: CartRecommendation[] = [
  {
    id: 1,
    href: "/products/8",
    image: "/images/gallery-photo.png",
    name: "Minimalist Crystal Vase",
    price: 24,
  },
  {
    id: 2,
    href: "/products/1",
    image: "/images/hero-main.png",
    name: "Gardenia Scented Candle",
    price: 18,
  },
  {
    id: 3,
    href: "/products/5",
    image: "/images/process-step-2.png",
    name: "Artisan Pruning Shears",
    price: 35,
  },
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(value);
}

export function getCartItemVariant(item: CartItem) {
  const parts = [SIZE_LABELS[item.size]];

  if (item.ribbon) {
    parts.push(`${item.ribbon} Ribbon`);
  }

  return parts.join(" / ");
}
