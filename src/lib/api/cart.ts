import { apiClient } from "./client";
import { CartDTO, AddCartItemRequest, UpdateCartItemRequest } from "./types";

export const cartApi = {
  async get(): Promise<CartDTO> {
    const { data } = await apiClient.get<CartDTO>("/api/cart");
    return data;
  },

  async addItem(request: AddCartItemRequest): Promise<CartDTO> {
    const { data } = await apiClient.post<CartDTO>("/api/cart/items", request);
    return data;
  },

  async updateItem(
    itemId: number,
    request: UpdateCartItemRequest
  ): Promise<CartDTO> {
    const { data } = await apiClient.put<CartDTO>(
      `/api/cart/items/${itemId}`,
      request
    );
    return data;
  },

  async deleteItem(itemId: number): Promise<void> {
    await apiClient.delete(`/api/cart/items/${itemId}`);
  },
};
