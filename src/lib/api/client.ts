import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ApiError } from "./types";
import { getToken, clearToken } from "../auth/storage";

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

interface ErrorResponse {
  message?: string;
  code?: string;
  errors?: Array<{
    defaultMessage?: string;
  }>;
}

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  __retryCount?: number;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  timeout: 12000,
});

export function extractApiErrorMessage(error: AxiosError<ErrorResponse>): string {
  const isNetworkFailure = !error.response;

  if (isNetworkFailure) {
    return "Cannot connect to backend server. Please check BE is running on http://127.0.0.1:8080.";
  }

  return (
    error.response?.data?.errors?.[0]?.defaultMessage ||
    error.response?.data?.message ||
    error.message ||
    "An error occurred"
  );
}

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isFormData) {
      config.headers.delete?.("Content-Type");
    } else if (!config.headers.get?.("Content-Type")) {
      config.headers.set?.("Content-Type", "application/json");
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

    const apiError: ApiError = {
      message: extractApiErrorMessage(error),
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
