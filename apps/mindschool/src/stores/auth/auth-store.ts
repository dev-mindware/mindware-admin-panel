import { useAuthStore as useSharedAuthStore } from "@workspace/hooks";

/** Utilizador do painel (do `BaseUser` partilhado): o papel é sempre `admin` (só administradores de sistema entram). */
export const useAuthStore = useSharedAuthStore;
