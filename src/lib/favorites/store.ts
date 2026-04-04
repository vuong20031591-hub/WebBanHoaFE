"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FavoriteItem, FavoritesState } from "./types";

interface LegacyFavoritesState {
  activeUserId?: string | null;
  items?: FavoriteItem[];
}

const GUEST_BUCKET = "__guest__";

function bucketKey(userId: string | null): string {
  return userId ?? GUEST_BUCKET;
}

function exists(items: FavoriteItem[], productId: number): boolean {
  return items.some((item) => item.productId === productId);
}

function mergeActiveItemsIntoBuckets(
  state: FavoritesState,
  nextItems: FavoriteItem[]
): Record<string, FavoriteItem[]> {
  return {
    ...state.favoritesByUser,
    [bucketKey(state.activeUserId)]: nextItems,
  };
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      activeUserId: null,
      items: [],
      favoritesByUser: {
        [GUEST_BUCKET]: [],
      },

      setActiveUser: (userId) =>
        set((state) => {
          if (state.activeUserId === userId) {
            return state;
          }

          const bucketsWithCurrent = mergeActiveItemsIntoBuckets(state, state.items);
          const nextItems = bucketsWithCurrent[bucketKey(userId)] ?? [];

          return {
            activeUserId: userId,
            items: nextItems,
            favoritesByUser: bucketsWithCurrent,
          };
        }),

      addFavorite: (item) =>
        set((state) => {
          if (exists(state.items, item.productId)) {
            return state;
          }

          const nextItems = [item, ...state.items];
          return {
            items: nextItems,
            favoritesByUser: mergeActiveItemsIntoBuckets(state, nextItems),
          };
        }),

      removeFavorite: (productId) =>
        set((state) => {
          const nextItems = state.items.filter((item) => item.productId !== productId);
          return {
            items: nextItems,
            favoritesByUser: mergeActiveItemsIntoBuckets(state, nextItems),
          };
        }),

      toggleFavorite: (item) =>
        set((state) => {
          if (exists(state.items, item.productId)) {
            const nextItems = state.items.filter(
              (favorite) => favorite.productId !== item.productId
            );

            return {
              items: nextItems,
              favoritesByUser: mergeActiveItemsIntoBuckets(state, nextItems),
            };
          }

          const nextItems = [item, ...state.items];
          return {
            items: nextItems,
            favoritesByUser: mergeActiveItemsIntoBuckets(state, nextItems),
          };
        }),

      isFavorite: (productId) => exists(get().items, productId),

      clearFavorites: () =>
        set((state) => ({
          items: [],
          favoritesByUser: mergeActiveItemsIntoBuckets(state, []),
        })),
    }),
    {
      name: "floral-favorites-storage",
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const legacy = persistedState as LegacyFavoritesState;

        if (version < 2 && legacy && Array.isArray(legacy.items)) {
          const activeUserId = legacy.activeUserId ?? null;
          const key = bucketKey(activeUserId);

          return {
            activeUserId,
            items: legacy.items,
            favoritesByUser: {
              [GUEST_BUCKET]: activeUserId ? [] : legacy.items,
              [key]: legacy.items,
            },
          };
        }

        return persistedState;
      },
    }
  )
);
