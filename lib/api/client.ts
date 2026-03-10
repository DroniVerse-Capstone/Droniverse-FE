import { ApiError } from "@/types/api/common";
import {
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  setAuthCookies,
} from "@/lib/auth/cookies";
import { useAuthStore } from "@/stores/auth-store";
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { User } from "@/validations/auth";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

interface RefreshTokenResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
  isSuccess: boolean;
  message: string;
}

const AUTH_EXCLUDED_PATHS = ["/auth/login", "/auth/register", "/auth/refresh-token"];

const shouldSkipAuthHandling = (
  config?: InternalAxiosRequestConfig,
) => {
  const requestUrl = config?.url;

  if (!requestUrl) {
    return false;
  }

  return AUTH_EXCLUDED_PATHS.some((path) => requestUrl.includes(path));
};

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = getAccessToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
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

    if (shouldSkipAuthHandling(originalRequest)) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        originalRequest._retry = true;

        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (!token) {
              return Promise.reject(error);
            }

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }

            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      const currentAccessToken = getAccessToken();

      if (!refreshToken || !currentAccessToken) {
        // No refresh token or access token, logout
        isRefreshing = false;
        if (typeof window !== "undefined") {
          clearAuthCookies();
          useAuthStore.getState().clearUser();
          window.location.href = "/auth/login";
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<RefreshTokenResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
          {
            refreshToken,
            accessToken: currentAccessToken,
          },
        );

        const {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user,
        } = response.data.data;
        
        if (typeof window !== "undefined") {
          setAuthCookies(
            newAccessToken,
            newRefreshToken,
            user.roleName,
          );
          useAuthStore.getState().setUser(user);
        }

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        processQueue(refreshError as Error, null);
        
        if (typeof window !== "undefined") {
          clearAuthCookies();
          useAuthStore.getState().clearUser();
          window.location.href = "/auth/login";
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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

    // Return AxiosError để TanStack Query có thể handle properly
    return Promise.reject(error);
  }
);

export default apiClient;