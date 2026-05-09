import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { serviceService } from "@/services/service-service";
import { Service } from "@workspace/types/affiliate";
import { usePagination } from "@workspace/hooks";
import { api } from "@/services/api";

export function useServices() {
  return usePagination<Service>({
    endpoint: "/admin/services",
    queryKey: "services",
    api,
  });
}

export function useAllServices() {
  return useQuery<Service[]>({
    queryKey: ["services", "all"],
    queryFn: async () => {
      const response = await serviceService.getServices(1, 100);
      return response.data.items;
    },
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Service>) => serviceService.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Service> }) =>
      serviceService.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => serviceService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}
