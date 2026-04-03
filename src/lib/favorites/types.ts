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
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (productId: number) => void;
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (productId: number) => boolean;
  clearFavorites: () => void;
}
