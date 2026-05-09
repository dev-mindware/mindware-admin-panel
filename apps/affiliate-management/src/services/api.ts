import axios from "axios";
import { ACCESS_TOKEN_KEY } from "@/constants/auth";

const isServer = typeof window === "undefined";
let accessTokenCache: string | null = null;

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  let token = null;

  if (isServer) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    token = cookieStore.get(ACCESS_TOKEN_KEY)?.value || null;
  } else {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${ACCESS_TOKEN_KEY}=`);
    if (parts.length === 2) {
      token = parts.pop()?.split(";").shift() || null;
    }
  }

  const isAuthRoute =
    config.url?.includes("/auth/login") ||
    config.url?.includes("/auth/refresh");

  if (token && !isAuthRoute && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // If it's a server-side call, we don't do complex refresh in the interceptor
    if (isServer) {
        return Promise.reject(err);
    }

    if (
      original.url?.includes("/auth/login") ||
      original.url?.includes("/auth/refresh") ||
      original._retry
    ) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = "Bearer " + token;
            return api(original);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // Chama a rota interna do Next.js que gerencia os cookies de sessão
        const response = await axios.post("/api/auth/refresh");
        const newToken = response.data?.accessToken;

        if (newToken) {
          processQueue(null, newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        } else {
          throw new Error("Novo access token não recebido");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        if (typeof window !== "undefined") {
          window.location.replace("/auth/login");
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
