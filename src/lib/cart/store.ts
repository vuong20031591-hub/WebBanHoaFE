"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, CartState } from "./types";

const isSameItem = (
  currentItem: CartItem,
  nextItem: Pick<CartItem, "productId" | "size">
) =>
  currentItem.productId === nextItem.productId &&
  currentItem.size === nextItem.size;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      note: null,

      addItem: (item: CartItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (currentItem) => isSameItem(currentItem, item)
          );

          if (existingIndex >= 0) {
            const items = state.items.map((currentItem, index) =>
              index === existingIndex
                ? {
                    ...currentItem,
                    quantity: currentItem.quantity + item.quantity,
                  }
                : currentItem
            );

            return { items };
          }

          return { items: [...state.items, item] };
        });
      },

      removeItem: (productId: number, size: CartItem["size"]) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !isSameItem(item, { productId, size })
          ),
          note:
            state.items.filter((item) => !isSameItem(item, { productId, size }))
              .length === 0
              ? null
              : state.note,
        }));
      },

      updateQuantity: (
        productId: number,
        size: CartItem["size"],
        quantity: number
      ) => {
        set((state) => {
          if (quantity <= 0) {
            const items = state.items.filter(
              (item) => !isSameItem(item, { productId, size })
            );

            return {
              items,
              note: items.length === 0 ? null : state.note,
            };
          }

          return {
            items: state.items.map((item) =>
              isSameItem(item, { productId, size })
                ? { ...item, quantity }
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
        set({ items: [], note: null });
      },

      getTotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "floral-cart-storage",
    }
  )
);
