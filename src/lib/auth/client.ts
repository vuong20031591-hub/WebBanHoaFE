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
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
