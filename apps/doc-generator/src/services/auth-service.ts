import { api, setStoredSession, clearStoredSession, getStoredToken, getStoredUser } from "./api";
import { User, AuthResponse } from "@/types/auth";

export interface LoginDto {
  email: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    const { tokens, user, message } = response.data;
    if (tokens?.accessToken) {
      setStoredSession(tokens.accessToken, user);
    }
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>("/auth/profile");
    return response.data;
  },

  logout(): void {
    clearStoredSession();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  getUser(): User | null {
    return getStoredUser();
  },

  isAuthenticated(): boolean {
    return !!getStoredToken();
  },
};
