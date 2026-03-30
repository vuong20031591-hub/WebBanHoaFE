import { MOCK_CATEGORIES } from "./data";
import { Category } from "./types";

export class CategoryRepository {
  static getAll(): Category[] {
    return MOCK_CATEGORIES;
  }

  static getById(id: number): Category | undefined {
    return MOCK_CATEGORIES.find((c) => c.id === id);
  }
}
