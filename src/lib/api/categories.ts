import { apiClient } from "./client";
import { CategoryDTO } from "./types";

export const categoriesApi = {
  async getAll(): Promise<CategoryDTO[]> {
    const { data } = await apiClient.get<CategoryDTO[]>("/api/categories");
    return data;
  },
};
