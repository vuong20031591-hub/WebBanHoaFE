import { MOCK_PRODUCTS } from "./data";
import { Product } from "./types";

export class ProductRepository {
  static getAll(): Product[] {
    return MOCK_PRODUCTS;
  }

  static getById(id: number): Product | undefined {
    return MOCK_PRODUCTS.find((p) => p.id === id);
  }

  static getByIds(ids: number[]): Product[] {
    return MOCK_PRODUCTS.filter((p) => ids.includes(p.id));
  }

  static getByCategoryId(categoryId: number): Product[] {
    return MOCK_PRODUCTS.filter((p) => p.categoryId === categoryId);
  }
}
