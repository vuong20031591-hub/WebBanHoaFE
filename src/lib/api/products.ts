import { apiClient } from "./client";
import { PagedResponse, ProductDTO, ProductDetailDTO } from "./types";

export interface ProductSearchParams {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export const productsApi = {
  async search(params: ProductSearchParams = {}): Promise<PagedResponse<ProductDTO>> {
    const { data } = await apiClient.get<PagedResponse<ProductDTO>>(
      "/api/products/search",
      { params }
    );
    return data;
  },

  async getById(id: number): Promise<ProductDetailDTO> {
    const { data } = await apiClient.get<ProductDetailDTO>(`/api/products/${id}`);
    return data;
  },
};
