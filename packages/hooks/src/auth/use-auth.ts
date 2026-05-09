import { useAuthStore } from "./auth-store";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);
  const setIsAuthenticating = useAuthStore((state) => state.setIsAuthenticating);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const setLogout = useAuthStore((state) => state.setLogout);
  
  return { 
    user, 
    setUser, 
    isAuthenticating, 
    setIsAuthenticating,
    isLoggingOut,
    setLogout
  };
}
