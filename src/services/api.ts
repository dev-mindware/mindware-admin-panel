import axios from "axios";
import { getAccessToken } from "@/actions/token";
import { reauthenticate } from "@/actions/auth";

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
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "https://mindgest-api.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (original.url.includes("/auth/") || original._retry) {
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
        await reauthenticate();
        const newToken = await getAccessToken();

        if (newToken) {
          processQueue(null, newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error("Erro ao renovar token:", refreshError);
        window.location.replace("/auth/login");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  },
);

export default api;
