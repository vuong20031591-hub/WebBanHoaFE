import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ApiError } from "./types";
import { getToken, clearToken } from "../auth/storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

interface ErrorResponse {
  message?: string;
  code?: string;
}

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  __retryCount?: number;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
  timeout: 12000,
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const isNetworkError =
      axios.isAxiosError(error) &&
      (!error.response || error.code === "ECONNREFUSED" || error.code === "ECONNABORTED");

    if (isNetworkError && error.config) {
      const requestConfig = error.config as RetriableRequestConfig;
      const retryCount = requestConfig.__retryCount ?? 0;
      
      if (retryCount < 2) {
        requestConfig.__retryCount = retryCount + 1;
        const delayMs = 2000 * (retryCount + 1);
        console.log(`API retry ${retryCount + 1}/2 after ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return apiClient.request(requestConfig);
      }
    }

    if (error.response?.status === 401) {
      clearToken();
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
    }

    const isNetworkFailure = !error.response;

    const apiError: ApiError = {
      message: isNetworkFailure
        ? "Cannot connect to backend server. Please check BE is running on http://localhost:8080."
        : error.response?.data?.message || error.message || "An error occurred",
      code: error.response?.data?.code,
      status: error.response?.status,
    };

    return Promise.reject(apiError);
  }
);

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  );
}
