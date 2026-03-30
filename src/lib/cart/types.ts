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
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}
