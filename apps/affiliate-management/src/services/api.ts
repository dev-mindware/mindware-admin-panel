import axios from "axios";
import { getAccessToken } from "@/actions/token";
import { BASE_PATH } from "@/constants/routes";

let accessTokenCache: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

export const resetAccessTokenCache = () => {
  accessTokenCache = null;
};

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });

  failedQueue = [];
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const url = config.url || "";
  const isPublicAuthRoute =
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/forgot-password") ||
    url.includes("/auth/reset-password") ||
    url.includes("/auth/refresh");

  if (!isPublicAuthRoute) {
    if (!accessTokenCache) {
      accessTokenCache = await getAccessToken();
    }

    if (accessTokenCache) {
      config.headers.Authorization = `Bearer ${accessTokenCache}`;
    }
  }

  return config;
});

const refreshApi = axios.create({
  baseURL: "/",
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const url = original?.url || "";

    if (
      url.includes("/auth/login") ||
      url.includes("/auth/logout") ||
      url.includes("/auth/refresh") ||
      original?._retry
    ) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const response = await refreshApi.post(`${BASE_PATH}/api/auth/refresh`);
        const newToken = response.data?.accessToken;

        if (!newToken) {
          throw new Error("Novo access token nao recebido");
        }

        accessTokenCache = newToken;
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        resetAccessTokenCache();
        processQueue(refreshError, null);

        if (typeof window !== "undefined") {
          window.location.replace(`${BASE_PATH}/auth/login`);
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  },
);

export default api;
