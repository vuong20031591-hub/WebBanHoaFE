export interface CartNote {
  message: string;
  signature: string;
}

export interface CartItem {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  size: "classic" | "deluxe" | "grand";
  ribbon?: string;
  deliveryDate?: string;
  giftNote?: string;
}

export interface CartState {
  items: CartItem[];
  note: CartNote | null;
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, size: CartItem["size"]) => void;
  updateQuantity: (
    productId: number,
    size: CartItem["size"],
    quantity: number
  ) => void;
  setNote: (note: CartNote) => void;
  clearNote: () => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}
