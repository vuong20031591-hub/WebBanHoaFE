import { apiClient } from "./client";
import {
  AdminOrderStatsDTO,
  OrderDTO,
  PagedResponse,
  ProductDetailDTO,
} from "./types";

export interface AdminOrderQueryParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "ASC" | "DESC";
}

export type UpdatableOrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface AdminProductUpsertPayload {
  name: string;
  price: number;
  description?: string | null;
  image?: string | null;
  stockQuantity: number;
  categoryId: number;
}

const ADMIN_HEADERS = {
  "X-Role": "ADMIN",
};

export const adminOrdersApi = {
  async getStats(): Promise<AdminOrderStatsDTO> {
    const { data } = await apiClient.get<AdminOrderStatsDTO>("/api/admin/orders/stats", {
      headers: ADMIN_HEADERS,
    });
    return data;
  },

  async getOrders(
    params: AdminOrderQueryParams = {}
  ): Promise<PagedResponse<OrderDTO>> {
    const { data } = await apiClient.get<PagedResponse<OrderDTO>>("/api/admin/orders", {
      params,
      headers: ADMIN_HEADERS,
    });
    return data;
  },

  async updateOrderStatus(
    orderId: number,
    status: UpdatableOrderStatus
  ): Promise<OrderDTO> {
    const { data } = await apiClient.put<OrderDTO>(
      `/api/admin/orders/${orderId}/status`,
      { status },
      {
        headers: ADMIN_HEADERS,
      }
    );
    return data;
  },
};

export const adminProductsApi = {
  async createProduct(
    payload: AdminProductUpsertPayload
  ): Promise<ProductDetailDTO> {
    const { data } = await apiClient.post<ProductDetailDTO>(
      "/api/admin/products",
      payload,
      { headers: ADMIN_HEADERS }
    );
    return data;
  },

  async updateProduct(
    productId: number,
    payload: AdminProductUpsertPayload
  ): Promise<ProductDetailDTO> {
    const { data } = await apiClient.put<ProductDetailDTO>(
      `/api/admin/products/${productId}`,
      payload,
      { headers: ADMIN_HEADERS }
    );
    return data;
  },

  async deleteProduct(productId: number): Promise<void> {
    await apiClient.delete(`/api/admin/products/${productId}`, {
      headers: ADMIN_HEADERS,
    });
  },
};
