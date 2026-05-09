import { useAuthStore as useSharedAuthStore } from "@workspace/hooks";

export interface User {
  id: string;
  email: string;
  role: string;
  nome_completo?: string;
  name?: string;
}

export const useAuthStore = useSharedAuthStore;
