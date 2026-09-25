import {
  api,
  setStoredSession,
  clearStoredSession,
  getStoredToken,
  getStoredRefreshToken,
  getStoredUser,
} from "./api";
import { setServerSession, logoutAction } from "@/actions/auth";
import { User, AuthResponse } from "@/types/auth";

export interface LoginDto {
  email: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    const { tokens, user, message } = response.data;
    const accessToken = tokens?.accessToken || (response.data as any).accessToken;
    const refreshToken = tokens?.refreshToken || (response.data as any).refreshToken;

    if (accessToken) {
      setStoredSession(accessToken, refreshToken, user);
      if (refreshToken) {
        // Grava também a sessão nos cookies HttpOnly do Next.js via Server Action
        await setServerSession({
          accessToken,
          refreshToken,
          expiresIn: tokens?.expiresIn,
        }).catch((err) => console.warn("Aviso ao definir cookies do servidor:", err));
      }
    }
    return response.data;
  },

  async refreshToken(): Promise<string | null> {
    const currentRefreshToken = getStoredRefreshToken();
    if (!currentRefreshToken) return null;

    const response = await api.post<AuthResponse>("/auth/refresh", {
      refreshToken: currentRefreshToken,
    });

    const accessToken = response.data?.tokens?.accessToken || (response.data as any).accessToken;
    const refreshToken =
      response.data?.tokens?.refreshToken ||
      (response.data as any).refreshToken ||
      currentRefreshToken;
    const user = response.data?.user || getStoredUser();

    if (accessToken) {
      setStoredSession(accessToken, refreshToken, user);
      if (refreshToken) {
        await setServerSession({
          accessToken,
          refreshToken,
          expiresIn: response.data?.tokens?.expiresIn,
        }).catch(() => {});
      }
      return accessToken;
    }
    return null;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>("/auth/profile");
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout").catch(() => {});
      await logoutAction().catch(() => {});
    } finally {
      clearStoredSession();
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/doc-generator/auth/login";
      }
    }
  },

  getUser(): User | null {
    return getStoredUser();
  },

  isAuthenticated(): boolean {
    return !!getStoredToken();
  },
};
