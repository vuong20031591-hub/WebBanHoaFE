"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FavoriteItem, FavoritesState } from "./types";

function exists(items: FavoriteItem[], productId: number): boolean {
  return items.some((item) => item.productId === productId);
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],

      addFavorite: (item) =>
        set((state) => {
          if (exists(state.items, item.productId)) {
            return state;
          }
          return { items: [item, ...state.items] };
        }),

      removeFavorite: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),

      toggleFavorite: (item) =>
        set((state) => {
          if (exists(state.items, item.productId)) {
            return {
              items: state.items.filter(
                (favorite) => favorite.productId !== item.productId
              ),
            };
          }
          return { items: [item, ...state.items] };
        }),

      isFavorite: (productId) => exists(get().items, productId),

      clearFavorites: () => set({ items: [] }),
    }),
    {
      name: "floral-favorites-storage",
    }
  )
);
