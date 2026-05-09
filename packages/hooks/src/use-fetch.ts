import defaultApi from "./services/api";
import { useQuery } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

/**
 * Hook genérico para buscar dados da api
 * @param key Chave para o cache do React Query
 * @param endpoint URL do endpoint da api
 * @param options Opções adicionais do React Query
 * @param apiInstance Instância do Axios (usa a partilhada se não fornecida)
 */
export function useFetch<T>(key: string, endpoint: string, options: { api?: AxiosInstance; [key: string]: any } = {}) {
  const { api: apiInstance, ...queryOptions } = options;
  const api = apiInstance || defaultApi;

  return useQuery<T>({
    queryKey: [key],
    queryFn: async (): Promise<T> => {
      const response = await api.get<T>(endpoint);
      return response.data;
    },
    ...queryOptions,
  });
}
