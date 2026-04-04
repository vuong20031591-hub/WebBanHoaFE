import axios from "axios";
import { apiClient } from "@/lib/api/client";
import type {
  AuthUser,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordWithCodeRequest,
  UpdateProfileRequest,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  initialDelayMs = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const isNetworkError =
        axios.isAxiosError(error) &&
        (!error.response || error.code === "ECONNREFUSED" || error.code === "ECONNABORTED");

      if (!isNetworkError || attempt === maxRetries) {
        throw error;
      }

      const delayMs = initialDelayMs * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

export const authApi = {
  async register(data: RegisterRequest): Promise<AuthUser> {
    const response = await authClient.post<AuthUser>("/api/auth/register", data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await authClient.post<LoginResponse>("/api/auth/login", data);
    return response.data;
  },

  async loginWithGoogleToken(supabaseAccessToken: string): Promise<LoginResponse> {
    return retryWithBackoff(async () => {
      const response = await authClient.post<LoginResponse>(
        "/api/auth/oauth/google",
        {},
        {
          headers: {
            Authorization: `Bearer ${supabaseAccessToken}`,
          },
        }
      );
      return response.data;
    });
  },

  async me(token: string): Promise<AuthUser> {
    const response = await authClient.get<AuthUser>("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<AuthUser> {
    const response = await apiClient.put<AuthUser>("/api/auth/me", data);
    return response.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post("/api/auth/change-password", data);
  },

  async requestForgotPasswordCode(data: ForgotPasswordRequest): Promise<void> {
    await authClient.post("/api/auth/forgot-password/request", data);
  },

  async resetPasswordWithCode(data: ResetPasswordWithCodeRequest): Promise<void> {
    await authClient.post("/api/auth/forgot-password/confirm", data);
  },
};
