export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  categoryId: number;
  style?: string;
  occasion?: string;
}

export interface ProductFilters {
  name?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  style?: string;
  occasion?: string;
}

export interface PageData<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  last?: boolean;
  first?: boolean;
}
