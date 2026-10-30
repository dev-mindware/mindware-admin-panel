import { create } from "zustand";
import { User } from "@/types/auth";
import { clearStoredSession, getStoredUser, getStoredToken } from "@/services/api";

interface AuthState {
  user: User | null;
  isAuthenticating: boolean;
  isLoggingOut: boolean;
  /** Lê a sessão do localStorage. Só depois da hidratação, para o HTML do servidor e do cliente coincidirem. */
  hydrate: () => void;
  setUser: (user: User | null) => void;
  setIsAuthenticating: (isAuthenticating: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Estado inicial igual no servidor e no cliente (evita o erro de hidratação #418).
  user: null,
  isAuthenticating: true,
  isLoggingOut: false,

  hydrate: () => set({ user: getStoredUser(), isAuthenticating: !getStoredToken() }),

  setUser: (user) => set({ user }),
  setIsAuthenticating: (isAuthenticating) => set({ isAuthenticating }),

  logout: () => {
    if (get().isLoggingOut) return;
    set({ isLoggingOut: true, isAuthenticating: true, user: null });
    clearStoredSession();
    set({ isLoggingOut: false });

    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
  },
}));
