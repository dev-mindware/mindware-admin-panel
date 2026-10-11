import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { getStepUpToken, isStepUpRequired, requestStepUp } from "@workspace/hooks/step-up";
import { getAccessToken } from "@/actions/token";
import { BASE_PATH } from "@/constants/routes";

export const MFA_ENROLLMENT_EVENT = "mfa:enrollment-required";

let accessTokenCache: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

export const resetAccessTokenCache = () => {
  accessTokenCache = null;
};
export const setAccessTokenCache = (token: string | null) => {
  accessTokenCache = token;
};

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

/** Cliente da API MindSchool. Modo `bearer` (sem cookies da API); o token vive em cookies httpOnly desta zone. */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3011/api/v1",
  headers: { "Content-Type": "application/json", "x-auth-mode": "bearer" },
});

const isPublicAuthRoute = (url: string) => /\/auth\/(login|refresh|forgot-password|reset-password)/.test(url);

api.interceptors.request.use(async (config) => {
  const url = config.url || "";
  if (isPublicAuthRoute(url)) return config;
  if (!config.headers.Authorization) {
    // no servidor nunca se guarda em cache (a variável é partilhada entre pedidos de utilizadores diferentes)
    let token: string | null;
    if (typeof window === "undefined") token = await getAccessToken();
    else token = accessTokenCache ??= await getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  // reautenticação recente (step-up): segue em todos os pedidos enquanto válida, para não voltar a pedir a cada acção
  const stepUp = getStepUpToken();
  if (stepUp && !config.headers["X-Step-Up-Token"]) config.headers["X-Step-Up-Token"] = stepUp;
  return config;
});

const refreshApi = axios.create({ baseURL: "/", withCredentials: true });

const goToLogin = () => {
  if (typeof window !== "undefined") window.location.replace(`${BASE_PATH}/auth/login`);
};

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const url = original?.url || "";
    if (!original || isPublicAuthRoute(url) || url.includes("/auth/logout") || original._retry) return Promise.reject(err);

    const status = err.response?.status;

    // operação crítica: confirma a identidade e repete o pedido
    if (status === 401 && isStepUpRequired(err.response?.data)) {
      const token = await requestStepUp();
      original._retry = true;
      original.headers = { ...(original.headers ?? {}), "X-Step-Up-Token": token } as typeof original.headers;
      return api(original);
    }

    if (status === 401) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => failedQueue.push({ resolve, reject })).then((token) => {
          original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${token}` } as typeof original.headers;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const res = await refreshApi.post<{ accessToken?: string }>(`${BASE_PATH}/api/auth/refresh`);
        const token = res.data?.accessToken;
        if (!token) throw new Error("Novo token de acesso não recebido");
        accessTokenCache = token;
        processQueue(null, token);
        original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${token}` } as typeof original.headers;
        return api(original);
      } catch (refreshError) {
        resetAccessTokenCache();
        processQueue(refreshError, null);
        goToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // o papel exige o segundo factor e ainda não está activo: a interface leva o utilizador a activá-lo
    if (status === 403 && (err.response?.data as { code?: string } | undefined)?.code === "MFA_ENROLLMENT_REQUIRED" && typeof window !== "undefined") {
      window.dispatchEvent(new Event(MFA_ENROLLMENT_EVENT));
    }

    return Promise.reject(err);
  },
);

export default api;
