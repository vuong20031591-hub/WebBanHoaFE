import { clearToken, getToken } from "../auth/storage";
import { apiClient } from "./client";
import {
  AdminCollaboratorDTO,
  AdminCreateUserRequest,
  AdminCreateOrderRequest,
  AdminOrderStatsDTO,
  AdminProductUpsertRequest,
  AdminUpdateUserRequest,
  AdminUserDTO,
  CollaboratorBadge,
  OrderDTO,
  PagedResponse,
  ProductDetailDTO,
  UploadMediaResponse,
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
  page?: number;
  size?: number;
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

function normalizeLoopbackApiBaseUrl(url: string): string {
  if (typeof window === "undefined") {
    return url;
  }

  try {
    const parsed = new URL(url);
    const browserHost = window.location.hostname;

    if (browserHost === "127.0.0.1" && parsed.hostname === "localhost") {
      parsed.hostname = "127.0.0.1";
    }

    if (browserHost === "localhost" && parsed.hostname === "127.0.0.1") {
      parsed.hostname = "localhost";
    }

    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url;
  }
}

const PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080";

const API_BASE_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_BASE_URL || PUBLIC_API_BASE_URL
    : normalizeLoopbackApiBaseUrl(PUBLIC_API_BASE_URL);

async function uploadAdminFormData<T>(path: string, formData: FormData): Promise<T> {
  const headers = new Headers(ADMIN_HEADERS);
  const token = getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (response.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
  }

  let payload: { message?: string } | null = null;

  try {
    payload = (await response.json()) as { message?: string };
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw {
      message: payload?.message || "Unable to upload image right now.",
      status: response.status,
    };
  }

  return payload as T;
}

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

export const adminMediaApi = {
  async uploadProductImage(file: File): Promise<UploadMediaResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return uploadAdminFormData<UploadMediaResponse>("/api/admin/upload", formData);
  },

  async uploadProductImageFromUrl(imageUrl: string): Promise<UploadMediaResponse> {
    const { data } = await apiClient.post<UploadMediaResponse>(
      "/api/admin/upload/from-url",
      { imageUrl },
      {
        headers: {
          ...ADMIN_HEADERS,
        },
      }
    );
    return data;
  },
};

export const adminUsersApi = {
  async getUsers(params: AdminUserQueryParams = {}): Promise<PagedResponse<AdminUserDTO>> {
    const { data } = await apiClient.get<PagedResponse<AdminUserDTO>>("/api/admin/users", {
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

  async getUserById(id: number): Promise<AdminUserDTO> {
    const { data } = await apiClient.get<AdminUserDTO>(`/api/admin/users/${id}`, {
      headers: ADMIN_HEADERS,
    });
    return data;
  },

  async createUser(payload: AdminCreateUserRequest): Promise<AdminUserDTO> {
    const { data } = await apiClient.post<AdminUserDTO>("/api/admin/users", payload, {
      headers: ADMIN_HEADERS,
    });
    return data;
  },

  async updateUser(id: number, payload: AdminUpdateUserRequest): Promise<AdminUserDTO> {
    const { data } = await apiClient.put<AdminUserDTO>(`/api/admin/users/${id}`, payload, {
      headers: ADMIN_HEADERS,
    });
    return data;
  },

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/users/${id}`, {
      headers: ADMIN_HEADERS,
    });
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
