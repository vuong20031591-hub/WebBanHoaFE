import { CartItem, CartNote } from "@/lib/cart";
import type { AppLocale } from "@/lib/i18n/messages";

export interface CartRecommendation {
  id: number;
  href: string;
  image: string;
  name: string;
  price: number;
}

const SIZE_LABELS: Record<AppLocale, Record<CartItem["size"], string>> = {
  en: {
    classic: "Classic Arrangement",
    deluxe: "Standard Arrangement",
    grand: "Large Vase Included",
  },
  vi: {
    classic: "Bo co dien",
    deluxe: "Bo tieu chuan",
    grand: "Bo lon kem binh",
  },
};

export function getCartItemVariant(item: CartItem, locale: AppLocale = "en") {
  const parts = [SIZE_LABELS[locale][item.size]];

  if (item.ribbon) {
    parts.push(locale === "vi" ? `Nơ ${item.ribbon}` : `${item.ribbon} Ribbon`);
  }

  return parts.join(" / ");
}

export function createEmptyNote(): CartNote {
  return {
    message: "",
    signature: "",
  };
}
