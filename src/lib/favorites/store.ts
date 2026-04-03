"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FavoriteItem, FavoritesState } from "./types";

interface PersistedFavoritesState {
  items?: FavoriteItem[];
  activeUserId?: string | null;
  itemsByUserId?: Record<string, FavoriteItem[]>;
  [key: string]: unknown;
}

const GUEST_KEY = "__guest__";

function exists(items: FavoriteItem[], productId: number): boolean {
  return items.some((item) => item.productId === productId);
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      activeUserId: null,
      itemsByUserId: {
        [GUEST_KEY]: [],
      } as Record<string, FavoriteItem[]>,

      setActiveUser: (userId) =>
        set((state) => {
          const key = userId ?? GUEST_KEY;
          return {
            activeUserId: userId,
            items: state.itemsByUserId[key] ?? [],
          };
        }),

      addFavorite: (item) =>
        set((state) => {
          const key = state.activeUserId ?? GUEST_KEY;
          const currentItems = state.itemsByUserId[key] ?? [];
          if (exists(currentItems, item.productId)) {
            return state;
          }
          const nextItems = [item, ...currentItems];
          return {
            items: nextItems,
            itemsByUserId: {
              ...state.itemsByUserId,
              [key]: nextItems,
            },
          };
        }),

      removeFavorite: (productId) =>
        set((state) => {
          const key = state.activeUserId ?? GUEST_KEY;
          const currentItems = state.itemsByUserId[key] ?? [];
          const nextItems = currentItems.filter((item) => item.productId !== productId);
          return {
            items: nextItems,
            itemsByUserId: {
              ...state.itemsByUserId,
              [key]: nextItems,
            },
          };
        }),

      toggleFavorite: (item) =>
        set((state) => {
          const key = state.activeUserId ?? GUEST_KEY;
          const currentItems = state.itemsByUserId[key] ?? [];
          if (exists(currentItems, item.productId)) {
            const nextItems = currentItems.filter(
              (favorite) => favorite.productId !== item.productId
            );
            return {
              items: nextItems,
              itemsByUserId: {
                ...state.itemsByUserId,
                [key]: nextItems,
              },
            };
          }
          const nextItems = [item, ...currentItems];
          return {
            items: nextItems,
            itemsByUserId: {
              ...state.itemsByUserId,
              [key]: nextItems,
            },
          };
        }),

      isFavorite: (productId) => exists(get().items, productId),

      clearFavorites: () =>
        set((state) => {
          const key = state.activeUserId ?? GUEST_KEY;
          return {
            items: [],
            itemsByUserId: {
              ...state.itemsByUserId,
              [key]: [],
            },
          };
        }),
    }),
    {
      name: "floral-favorites-storage",
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = (persistedState ?? {}) as PersistedFavoritesState;

        // Version 1 stored a flat array in `items`.
        if (version < 2) {
          const legacyItems = Array.isArray(state.items) ? state.items : [];
          return {
            items: legacyItems,
            activeUserId: null,
            itemsByUserId: {
              [GUEST_KEY]: legacyItems,
            } as Record<string, FavoriteItem[]>,
          };
        }

        const itemsByUserId = state.itemsByUserId ?? { [GUEST_KEY]: [] };
        const activeUserId = state.activeUserId ?? null;
        const activeKey = activeUserId ?? GUEST_KEY;

        return {
          items: itemsByUserId[activeKey] ?? [],
          activeUserId,
          itemsByUserId,
        };
      },
    }
  )
);
