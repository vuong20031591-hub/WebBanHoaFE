import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ApiError } from "./types";
import { getToken, clearToken } from "../auth/storage";

const API_BASE_URL =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

interface ErrorResponse {
  message?: string;
  code?: string;
}

async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
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
      console.log(`API retry ${attempt + 1}/${maxRetries} after ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

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
      const retryCount = (error.config as any).__retryCount || 0;
      
      if (retryCount < 2) {
        (error.config as any).__retryCount = retryCount + 1;
        const delayMs = 2000 * (retryCount + 1);
        console.log(`API retry ${retryCount + 1}/2 after ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return apiClient.request(error.config);
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
