import { useAuthStore } from "@workspace/hooks";
import { logoutAction } from "@/actions/login";

export function useLogout() {
  const { setLogout, setUser } = useAuthStore();

  const logout = async () => {
    setLogout(true);
    try {
      await logoutAction();
      setUser(null);
    } finally {
      setLogout(false);
    }
  };

  return { logout };
}
