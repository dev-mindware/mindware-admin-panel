"use client";
import { BaseUser } from '@/types';

type SessionProviderProps = {
  children: React.ReactNode;
  user: BaseUser | null;
}

export function SessionProvider({ user, children }: SessionProviderProps) {
/*   const { setUser } = useAuth();

  useEffect(() => {
    setUser(user as User);
  }, [user, setUser]); */

  return <>{children}</>;
}