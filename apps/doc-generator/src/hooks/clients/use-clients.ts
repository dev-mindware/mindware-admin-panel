"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientsService, Client, CreateClientDto } from "@/services/clients-service";
import { PaginationParams } from "@/types/pagination";
import { errorMessage } from "@/hooks/use-activities";

export const clientKeys = {
  all: ["clients"] as const,
  list: (params?: PaginationParams) => ["clients", "list", params] as const,
  detail: (id: string) => ["clients", "detail", id] as const,
};

export function useClientsList(params?: PaginationParams) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => clientsService.getClients(params),
  });
}

export function useCreateClient(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientDto) => clientsService.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      toast.success("Cliente registado com sucesso!");
      onSuccessCallback?.();
    },
    onError: (err: unknown) => {
      toast.error(errorMessage(err, "Erro ao registar cliente."));
    },
  });
}

