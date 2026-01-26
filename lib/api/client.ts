import { ApiError } from "@/types/api/common";
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://jsonplaceholder.typicode.com",
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = typeof window !== "undefined" 
      ? localStorage.getItem("access_token") 
      : null;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log("🚀 Request:", config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Response:", response.status, response.config.url);
    }

    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = typeof window !== "undefined"
          ? localStorage.getItem("refresh_token")
          : null;

        if (refreshToken) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken }
          );

          const { accessToken } = response.data;
          
          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", accessToken);
          }

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Response Error:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
      });
    }

    // Format error message
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    return Promise.reject({
      message: errorMessage,
      statusCode: error.response?.status,
      errors: error.response?.data?.errors,
    } as ApiError);
  }
);

export default apiClient;