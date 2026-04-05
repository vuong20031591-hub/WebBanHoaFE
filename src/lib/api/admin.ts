import { apiClient } from "./client";
import {
  AdminCollaboratorDTO,
  AdminCreateOrderRequest,
  AdminOrderStatsDTO,
  AdminProductUpsertRequest,
  AdminUserDTO,
  CollaboratorBadge,
  OrderDTO,
  PagedResponse,
  ProductDetailDTO,
} from "./types";

export interface AdminOrderQueryParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  includeUserProfile?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "ASC" | "DESC";
}

export interface AdminUserQueryParams {
  role?: "USER" | "ADMIN";
}

export interface InviteCollaboratorPayload {
  userId: number;
  badge: CollaboratorBadge;
  positionTitle: string;
  positionDescription?: string;
}

export interface UpdateCollaboratorPayload {
  badge: CollaboratorBadge;
  positionTitle: string;
  positionDescription?: string;
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

export const adminUsersApi = {
  async getUsers(params: AdminUserQueryParams = {}): Promise<AdminUserDTO[]> {
    const { data } = await apiClient.get<AdminUserDTO[]>("/api/admin/users", {
      params,
      headers: ADMIN_HEADERS,
    });
    return data;
  },

  async updateUserRole(id: number, role: "USER" | "ADMIN"): Promise<AdminUserDTO> {
    const { data } = await apiClient.patch<AdminUserDTO>(
      `/api/admin/users/${id}/role`,
      { role },
      {
        headers: ADMIN_HEADERS,
      }
    );
    return data;
  },
};

export const adminCollaboratorsApi = {
  async getCollaborators(): Promise<AdminCollaboratorDTO[]> {
    const { data } = await apiClient.get<AdminCollaboratorDTO[]>("/api/admin/collaborators", {
      headers: ADMIN_HEADERS,
    });
    return data;
  },

  async getInviteCandidates(): Promise<AdminUserDTO[]> {
    const { data } = await apiClient.get<AdminUserDTO[]>("/api/admin/collaborators/candidates", {
      headers: ADMIN_HEADERS,
    });
    return data;
  },

  async inviteCollaborator(payload: InviteCollaboratorPayload): Promise<AdminCollaboratorDTO> {
    const { data } = await apiClient.post<AdminCollaboratorDTO>(
      "/api/admin/collaborators",
      payload,
      {
        headers: ADMIN_HEADERS,
      }
    );
    return data;
  },

  async updateCollaborator(
    id: number,
    payload: UpdateCollaboratorPayload
  ): Promise<AdminCollaboratorDTO> {
    const { data } = await apiClient.patch<AdminCollaboratorDTO>(
      `/api/admin/collaborators/${id}`,
      payload,
      {
        headers: ADMIN_HEADERS,
      }
    );
    return data;
  },

  async removeCollaborator(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/collaborators/${id}`, {
      headers: ADMIN_HEADERS,
    });
  },
};
