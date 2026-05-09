import defaultApi from "./services/api";
import { useQuery } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

/**
 * Hook genérico para buscar dados pelo ID
 * @param key Chave única para cache no React Query
 * @param endpoint Rota da api (ex: "/api/users/")
 * @param id Identificador do recurso
 * @param options Opções adicionais (incluindo api instance)
 */
export function useFetchById<T>(key: string, endpoint: string, id: string, options: { api?: AxiosInstance; enabled?: boolean; staleTime?: number } = {}) {
  const { api: apiInstance, enabled = true, staleTime = 1000 * 60 * 5 } = options;
  const api = apiInstance || defaultApi;

  return useQuery<T>({
    queryKey: [key, id], 
    queryFn: async (): Promise<T> => {
      if (!id) throw new Error("ID não fornecido");
      const response = await api.get<T>(`${endpoint}/${id}`);
      return response.data;
    },
    enabled: !!id && enabled, 
    staleTime, 
  });
}
