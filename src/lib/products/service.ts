import { Product, ProductFilters, PageData } from "./types";
import { ProductRepository } from "./repository";

export class ProductService {
  static filter(filters: ProductFilters): Product[] {
    let products = ProductRepository.getAll();

    if (filters.name) {
      const query = filters.name.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(query));
    }

    if (filters.categoryId) {
      const catId = Number(filters.categoryId);
      products = products.filter((p) => p.categoryId === catId);
    }

    if (filters.minPrice) {
      const min = Number(filters.minPrice);
      products = products.filter((p) => p.price >= min);
    }

    if (filters.maxPrice) {
      const max = Number(filters.maxPrice);
      products = products.filter((p) => p.price <= max);
    }

    if (filters.style) {
      products = products.filter((p) => p.style === filters.style);
    }

    if (filters.occasion) {
      products = products.filter((p) => p.occasion === filters.occasion);
    }

    return products;
  }

  static paginate(
    products: Product[],
    page: number,
    size: number
  ): PageData<Product> {
    const start = page * size;
    const end = start + size;
    const content = products.slice(start, end);
    const totalPages = Math.ceil(products.length / size);

    return {
      content,
      totalPages,
      totalElements: products.length,
      number: page,
      first: page === 0,
      last: page === totalPages - 1,
    };
  }

  static getRelated(productId: number, limit: number = 4): Product[] {
    const product = ProductRepository.getById(productId);
    if (!product) return [];

    return ProductRepository.getAll()
      .filter((p) => p.id !== productId && p.categoryId === product.categoryId)
      .slice(0, limit);
  }
}
