"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartVariantItem, CartState, ServerCartEntry } from "./types";
import { generateUUID } from "./utils";

// Legacy schema type for migration
interface LegacyCartState {
  items?: Array<{
    productId: number;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    size: "classic" | "deluxe" | "grand";
    ribbon?: string;
    deliveryDate?: string;
    giftNote?: string;
  }>;
  note?: { message: string; signature: string } | null;
  [key: string]: unknown;
}

const findItemByFullCustomization = (
  items: CartVariantItem[],
  productId: number,
  size: CartVariantItem["size"],
  ribbon?: string,
  deliveryDate?: string,
  giftNote?: string
) => items.find(item => 
  item.productId === productId && 
  item.size === size &&
  item.ribbon === ribbon &&
  item.deliveryDate === deliveryDate &&
  item.giftNote === giftNote
);

const getTotalQuantityForProduct = (
  variants: CartVariantItem[],
  productId: number,
  excludeLocalId?: string
): number => {
  return variants
    .filter(v => v.productId === productId && v.localId !== excludeLocalId)
    .reduce((sum, v) => sum + v.quantity, 0);
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      variants: [],
      syncState: {
        entries: {},
        lastSyncedUserId: null,
      },
      note: null,

      addItem: (item) => {
        set((state) => {
          const itemWithId: CartVariantItem = {
            ...item,
            localId: generateUUID(),
          };

          // Find exact match by full customization
          const existingItem = findItemByFullCustomization(
            state.variants,
            item.productId,
            item.size,
            item.ribbon,
            item.deliveryDate,
            item.giftNote
          );

          if (existingItem) {
            // Same customization → merge quantity
            const newQuantity = existingItem.quantity + item.quantity;
            
            // Clamp to stock if known (use newer stock info if available)
            const stockToUse = item.availableStock ?? existingItem.availableStock;
            
            // Per-variant clamp
            let clampedQuantity = stockToUse !== null
              ? Math.min(newQuantity, stockToUse)
              : newQuantity;

            // Cross-variant clamp: check total for productId
            if (stockToUse !== null) {
              const otherVariantsTotal = getTotalQuantityForProduct(
                state.variants,
                item.productId,
                existingItem.localId
              );
              const allowance = Math.max(0, stockToUse - otherVariantsTotal);
              clampedQuantity = Math.min(clampedQuantity, allowance);
            }

            // If clamped to 0, reject add
            if (clampedQuantity <= 0) {
              console.warn(`Product ${item.productId}: rejected add (stock full)`);
              return state;
            }

            const variants = state.variants.map((currentItem) =>
              currentItem.localId === existingItem.localId
                ? {
                    ...currentItem,
                    quantity: clampedQuantity,
                    availableStock: stockToUse,
                  }
                : currentItem
            );

            return { variants };
          }

          // New variant: clamp against existing variants of same product
          let clampedQuantity = item.quantity;
          if (item.availableStock !== null) {
            const otherVariantsTotal = getTotalQuantityForProduct(
              state.variants,
              item.productId
            );
            const allowance = Math.max(0, item.availableStock - otherVariantsTotal);
            clampedQuantity = Math.min(item.quantity, allowance);
          }

          // If clamped to 0, don't add new variant
          if (clampedQuantity <= 0) {
            console.warn(`Product ${item.productId}: rejected add (stock full)`);
            return state;
          }

          return { variants: [...state.variants, { ...itemWithId, quantity: clampedQuantity }] };
        });
      },

      removeItem: (localId: string) => {
        set((state) => {
          const variants = state.variants.filter(
            (item) => item.localId !== localId
          );

          return {
            variants,
            note: variants.length === 0 ? null : state.note,
          };
        });
      },

      updateQuantity: (localId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            const variants = state.variants.filter(
              (item) => item.localId !== localId
            );

            return {
              variants,
              note: variants.length === 0 ? null : state.note,
            };
          }

          const targetItem = state.variants.find(item => item.localId === localId);
          if (!targetItem) return state;

          // Per-variant clamp
          let clampedQuantity = targetItem.availableStock !== null
            ? Math.min(quantity, targetItem.availableStock)
            : quantity;

          // Cross-variant clamp
          if (targetItem.availableStock !== null) {
            const otherVariantsTotal = getTotalQuantityForProduct(
              state.variants,
              targetItem.productId,
              localId
            );
            const allowance = Math.max(0, targetItem.availableStock - otherVariantsTotal);
            clampedQuantity = Math.min(clampedQuantity, allowance);
          }

          // If clamped to 0, remove variant
          if (clampedQuantity <= 0) {
            console.warn(`Product ${targetItem.productId}: removed variant (stock full)`);
            const variants = state.variants.filter(item => item.localId !== localId);
            return {
              variants,
              note: variants.length === 0 ? null : state.note,
            };
          }

          return {
            variants: state.variants.map((item) =>
              item.localId === localId
                ? { ...item, quantity: clampedQuantity }
                : item
            ),
          };
        });
      },

      setNote: (note) => {
        set({ note });
      },

      clearNote: () => {
        set({ note: null });
      },

      clearCart: () => {
        set({ 
          variants: [], 
          note: null,
          syncState: {
            entries: {},
            lastSyncedUserId: null,
          },
        });
      },

      getTotal: () => {
        return get().variants.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().variants.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSyncEntry: (productId: number) => {
        return get().syncState.entries[productId.toString()];
      },

      updateSyncEntry: (productId: number, updates: Partial<ServerCartEntry>) => {
        set((state) => {
          const key = productId.toString();
          const existing = state.syncState.entries[key];

          return {
            syncState: {
              ...state.syncState,
              entries: {
                ...state.syncState.entries,
                [key]: {
                  productId,
                  serverCartItemId: existing?.serverCartItemId ?? null,
                  serverQuantity: existing?.serverQuantity ?? 0,
                  syncStatus: existing?.syncStatus ?? "syncing",
                  ...updates,
                },
              },
            },
          };
        });
      },

      removeSyncEntry: (productId: number) => {
        set((state) => {
          const entries = { ...state.syncState.entries };
          delete entries[productId.toString()];
          return {
            syncState: {
              ...state.syncState,
              entries,
            },
          };
        });
      },

      clearSyncState: () => {
        set((state) => ({
          syncState: {
            entries: {},
            lastSyncedUserId: state.syncState.lastSyncedUserId, // Keep ownership
          },
        }));
      },

      replaceCart: (variants: CartVariantItem[], syncState) => {
        set({ variants, syncState });
      },
    }),
    {
      name: "floral-cart-storage",
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        // Type guard for legacy state
        const isLegacyState = (state: unknown): state is LegacyCartState => {
          return (
            typeof state === "object" &&
            state !== null &&
            "items" in state &&
            Array.isArray((state as LegacyCartState).items)
          );
        };

        // Version 1 → 2: items → variants
        if (version < 2 && isLegacyState(persistedState)) {
          const oldItems = persistedState.items!;

          const variants: CartVariantItem[] = oldItems.map(item => ({
            ...item,
            localId: generateUUID(),
            availableStock: null,
          }));

          return {
            variants,
            syncState: {
              entries: {},
              lastSyncedUserId: null,
            },
            note: persistedState.note ?? null,
          };
        }

        // Already version 2 or higher
        return persistedState as CartState;
      },
    }
  )
);
