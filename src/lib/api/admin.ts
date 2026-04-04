import { apiClient } from "./client";
import {
  AdminCreateOrderRequest,
  AdminOrderStatsDTO,
  AdminProductUpsertRequest,
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

const ADMIN_HEADERS = {
  "X-Role": "ADMIN",
};

export const adminOrdersApi = {
  async createOrder(request: AdminCreateOrderRequest): Promise<OrderDTO> {
    const { data } = await apiClient.post<OrderDTO>("/api/admin/orders", request, {
      headers: ADMIN_HEADERS,
    });
    return data;
  },

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
    id: number,
    status: "PENDING" | "CONFIRMED" | "CANCELLED"
  ): Promise<OrderDTO> {
    const { data } = await apiClient.put<OrderDTO>(
      `/api/admin/orders/${id}/status`,
      { status },
      {
        headers: ADMIN_HEADERS,
      }
    );
    return data;
  },
};

export const adminProductsApi = {
  async createProduct(request: AdminProductUpsertRequest): Promise<ProductDetailDTO> {
    const { data } = await apiClient.post<ProductDetailDTO>("/api/admin/products", request, {
      headers: ADMIN_HEADERS,
    });
    return data;
  },

  async updateProduct(
    id: number,
    request: AdminProductUpsertRequest
  ): Promise<ProductDetailDTO> {
    const { data } = await apiClient.put<ProductDetailDTO>(
      `/api/admin/products/${id}`,
      request,
      {
        headers: ADMIN_HEADERS,
      }
    );
    return data;
  },

  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/products/${id}`, {
      headers: ADMIN_HEADERS,
    });
  },

  async restoreProduct(id: number): Promise<ProductDetailDTO> {
    const { data } = await apiClient.patch<ProductDetailDTO>(
      `/api/admin/products/${id}/restore`,
      undefined,
      {
        headers: ADMIN_HEADERS,
      }
    );
    return data;
  },

  async updateStock(id: number, stockQuantity: number): Promise<ProductDetailDTO> {
    const { data } = await apiClient.patch<ProductDetailDTO>(
      `/api/admin/products/${id}/stock`,
      { stockQuantity },
      {
        headers: ADMIN_HEADERS,
      }
    );
    return data;
  },
};
