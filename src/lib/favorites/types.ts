export interface FavoriteItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  href: string;
  stockQuantity: number | null;
}

export interface FavoritesState {
  items: FavoriteItem[];
  activeUserId: string | null;
  itemsByUserId: Record<string, FavoriteItem[]>;
  setActiveUser: (userId: string | null) => void;
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (productId: number) => void;
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (productId: number) => boolean;
  clearFavorites: () => void;
}
