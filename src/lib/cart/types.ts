export interface CartNote {
  message: string;
  signature: string;
}

export interface CartVariantItem {
  localId: string;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  availableStock: number | null;
  size: "classic" | "deluxe" | "grand";
  ribbon?: string;
  deliveryDate?: string;
  giftNote?: string;
}

export interface ServerCartEntry {
  productId: number;
  serverCartItemId: number | null;
  serverQuantity: number;
  syncStatus: "synced" | "syncing" | "error";
  errorMessage?: string;
}

export interface CartSyncState {
  entries: Record<string, ServerCartEntry>;
  lastSyncedUserId: string | null;
}

export interface CartState {
  variants: CartVariantItem[];
  syncState: CartSyncState;
  note: CartNote | null;
  addItem: (item: Omit<CartVariantItem, "localId">) => void;
  removeItem: (localId: string) => void;
  updateQuantity: (localId: string, quantity: number) => void;
  setNote: (note: CartNote) => void;
  clearNote: () => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getSyncEntry: (productId: number) => ServerCartEntry | undefined;
  updateSyncEntry: (productId: number, updates: Partial<ServerCartEntry>) => void;
  removeSyncEntry: (productId: number) => void;
  clearSyncState: () => void;
  replaceCart: (variants: CartVariantItem[], syncState: CartSyncState) => void;
}

// Backward compatibility
export type CartItem = CartVariantItem;
