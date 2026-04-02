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

export function getCartItemVariant(item: CartItem) {
  const parts = [SIZE_LABELS[item.size]];

  if (item.ribbon) {
    parts.push(`${item.ribbon} Ribbon`);
  }

  return parts.join(" / ");
}

export function createEmptyNote(): CartNote {
  return {
    message: "",
    signature: "",
  };
}
