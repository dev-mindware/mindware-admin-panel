import axios from "axios";
import { getAccessToken } from "@/actions/token";

let accessTokenCache: string | null = null;
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

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    ...(process.env.NEXT_PUBLIC_API_KEY
      ? { "x-api-key": process.env.NEXT_PUBLIC_API_KEY }
      : {}),
  },
});

api.interceptors.request.use(async (config) => {
  // Only fetch from cookie once (or after explicit cache invalidation)
  if (accessTokenCache === null) {
    accessTokenCache = await getAccessToken();
  }

  const isAuthRoute =
    config.url?.includes("/auth/login") ||
    config.url?.includes("/auth/refresh");

  if (accessTokenCache && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${accessTokenCache}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // Ignore routes that shouldn't trigger refresh or are already retrying
    const url = original.url ?? "";
    if (
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      original._retry
    ) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401) {
      accessTokenCache = null;
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
        // Internal Next.js route call which handles HttpOnly cookies.
        // Must call the internal API route (not the external backend) so that
        // server-side cookie reading/writing works. The basePath "/mindgest" is
        // part of the route when accessed from the browser.
        const refreshUrl =
          typeof window !== "undefined"
            ? `/mindgest/api/auth/refresh`
            : `${process.env.NEXT_PUBLIC_MINDGEST_URL ?? "http://localhost:3000"}/mindgest/api/auth/refresh`;
        const response = await axios.post(refreshUrl);
        const newToken = response.data?.accessToken;

        if (newToken) {
          accessTokenCache = newToken;
          processQueue(null, newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        } else {
          throw new Error("Novo access token não recebido após reautenticação");
        }
      } catch (refreshError) {
        accessTokenCache = null;
        processQueue(refreshError, null);
        console.error("Erro ao renovar token:", refreshError);

        if (typeof window !== "undefined") {
          // window.location does NOT respect Next.js basePath — we must include it
          // manually. Without this the browser navigates to the portal's /auth/login
          // instead of mindgest's /mindgest/auth/login.
          const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/mindgest";
          window.location.replace(`${basePath}/auth/login`);
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
