import { CartItem, CartNote } from "@/lib/cart";

const ORDER_NUMBER_SEED = 74000;
const ORDER_NUMBER_SPAN = 1000;
const SIZE_RANK: Record<CartItem["size"], number> = {
  classic: 11,
  deluxe: 23,
  grand: 37,
};
const SIZE_LABEL: Record<CartItem["size"], string> = {
  classic: "CLASSIC",
  deluxe: "DELUXE",
  grand: "GRAND",
};

export const COMPLETE_FALLBACK_NOTE = {
  greeting: "Dear Evelyn,",
  message:
    "May these blooms bring as much light and beauty into your home as you bring into our lives every single day. Happy anniversary, my love.",
  signature: "- Forever Yours",
};

export const COMPLETE_EMPTY_NOTE = {
  greeting: "A personal touch awaits,",
  message:
    "Add a heartfelt message at checkout to see it beautifully presented here after the order is placed.",
  signature: "- Floral Boutique",
};

export const COMPLETE_SUCCESS_COPY = {
  title: "Thank you for choosing elegance",
  description: "has been received and is being prepared with absolute care.",
  emptyTitle: "No recent floral order yet",
  emptyDescription:
    "Complete your checkout to see this confirmation page filled with your order details.",
};

export const COMPLETE_PAYMENT_METHOD = "Cash on Delivery";
export const COMPLETE_NEXT_STEPS =
  "Our artisans are now hand-crafting your arrangement with the morning's freshest pickings.";
export const COMPLETE_AMOUNT_HELPER =
  "Please have this amount ready for our courier upon delivery.";

export function formatCompleteCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export function getCompleteOrderNumber(items: CartItem[]) {
  if (items.length === 0) {
    return String(ORDER_NUMBER_SEED);
  }

  const signature = items.reduce(
    (sum, item) =>
      sum +
      item.productId * 17 +
      item.quantity * 9 +
      SIZE_RANK[item.size],
    0
  );

  return String(ORDER_NUMBER_SEED + (signature % ORDER_NUMBER_SPAN));
}

export function getCompleteItemCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCompleteProductCount(items: CartItem[]) {
  return items.length;
}

export function getCompleteSummaryLabel(items: CartItem[]) {
  const productCount = getCompleteProductCount(items);

  if (productCount === 0) {
    return "ORDER DETAILS";
  }

  return `${productCount} ${productCount === 1 ? "ITEM" : "ITEMS"} ORDERED`;
}

export function getCompleteItemMeta(item: CartItem) {
  const prefix = item.ribbon
    ? `${item.ribbon.toUpperCase()} RIBBON`
    : "SIGNATURE ARRANGEMENT";
  const quantity = item.quantity > 1 ? ` / QTY ${item.quantity}` : "";

  return `${prefix} / ${SIZE_LABEL[item.size]}${quantity}`;
}

function formatSignature(signature: string) {
  const trimmed = signature.trim();

  if (!trimmed) {
    return COMPLETE_FALLBACK_NOTE.signature;
  }

  return trimmed.startsWith("-") ? trimmed : `- ${trimmed}`;
}

export function getCompleteNoteContent(
  note: CartNote | null,
  items: CartItem[]
) {
  const noteMessage = note?.message?.trim() ?? "";
  const noteSignature = note?.signature?.trim() ?? "";

  if (noteMessage || noteSignature) {
    return {
      greeting: "With your compliments,",
      message: noteMessage || COMPLETE_FALLBACK_NOTE.message,
      signature: formatSignature(noteSignature),
    };
  }

  const giftNote = items.find((item) => item.giftNote?.trim())?.giftNote?.trim();

  if (giftNote) {
    return {
      greeting: "With your compliments,",
      message: giftNote,
      signature: COMPLETE_FALLBACK_NOTE.signature,
    };
  }

  if (items.length === 0) {
    return COMPLETE_EMPTY_NOTE;
  }

  return COMPLETE_FALLBACK_NOTE;
}
