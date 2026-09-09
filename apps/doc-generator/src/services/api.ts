import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { clearLocalSession } from "@/actions/auth";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "@/constants/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Cache e Gestão de Sessão no Frontend
export { ACCESS_TOKEN_KEY as TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY };

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredSession(
  accessToken: string,
  refreshToken?: string | null,
  user?: any
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  clearLocalSession().catch(() => {});
}

export function getStoredUser(): any | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

const NO_REFRESH_ROUTES = ["/auth/login", "/auth/refresh", "/auth/refresh-token", "/auth/logout"];

function shouldSkipRefresh(url?: string): boolean {
  if (!url) return false;
  return NO_REFRESH_ROUTES.some((route) => url.includes(route));
}

function redirectToLogin(): void {
  if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
    window.location.href = "/doc-generator/auth/login?expired=true";
  }
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

function processQueue(error: any, token: string | null = null): void {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

// Request Interceptor: Injeta Bearer Token e API Key
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (API_KEY && config.headers) {
      config.headers["x-api-key"] = API_KEY;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: 401 transparent refresh chamando a rota local /api/auth/refresh (Next.js)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!original || !original.url) {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    if (shouldSkipRefresh(original.url) || original._retry) {
      return Promise.reject(error);
    }

    if (status === 401) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (original.headers) {
              (original.headers as any).Authorization = `Bearer ${token}`;
            }
            return api(original);
          })
          .catch((queueErr) => Promise.reject(queueErr));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // Chama a rota local de refresh do Next.js (onde os cookies HttpOnly são renovados)
        const response = await axios.post(
          "/doc-generator/api/auth/refresh",
          {},
          {
            timeout: 10000,
            withCredentials: true,
          }
        ).catch(() => {
          // Fallback para rota sem prefixo se necessário
          return axios.post("/api/auth/refresh", {}, { timeout: 10000, withCredentials: true });
        });

        const newAccessToken: string | undefined =
          response.data?.accessToken || response.data?.tokens?.accessToken;
        const newRefreshToken: string | undefined =
          response.data?.tokens?.refreshToken || response.data?.refreshToken;
        const user = response.data?.user || getStoredUser();

        if (!newAccessToken) {
          throw new Error("Novo access token não recebido após renovação");
        }

        setStoredSession(newAccessToken, newRefreshToken, user);
        processQueue(null, newAccessToken);

        if (original.headers) {
          (original.headers as any).Authorization = `Bearer ${newAccessToken}`;
        }

        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearStoredSession();
        redirectToLogin();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
