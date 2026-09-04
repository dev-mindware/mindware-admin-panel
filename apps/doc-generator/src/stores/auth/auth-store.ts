import { create } from "zustand";
import { User } from "@/types/auth";
import { clearStoredSession, getStoredUser, getStoredToken } from "@/services/api";

interface AuthState {
  user: User | null;
  isAuthenticating: boolean;
  isLoggingOut: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticating: (isAuthenticating: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: typeof window !== "undefined" ? getStoredUser() : null,
  isAuthenticating: typeof window !== "undefined" ? !getStoredToken() : true,
  isLoggingOut: false,

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
