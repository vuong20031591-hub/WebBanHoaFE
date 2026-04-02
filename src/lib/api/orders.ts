import { apiClient } from "./client";
import { CreateOrderFromCartRequest, OrderDTO } from "./types";

export const ordersApi = {
  async createFromCart(request: CreateOrderFromCartRequest): Promise<OrderDTO> {
    const { data } = await apiClient.post<OrderDTO>("/api/orders/from-cart", request);
    return data;
  },

  async getAll(): Promise<OrderDTO[]> {
    const { data } = await apiClient.get<OrderDTO[]>("/api/orders");
    return data;
  },

  async getById(id: number): Promise<OrderDTO> {
    const { data } = await apiClient.get<OrderDTO>(`/api/orders/${id}`);
    return data;
  },

  async getLatest(): Promise<OrderDTO> {
    const { data } = await apiClient.get<OrderDTO>("/api/orders/latest");
    return data;
  },
};
