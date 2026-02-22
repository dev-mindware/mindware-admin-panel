import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { planService } from "@/services/plan-service";
import { Plan, PlanCreateInput } from "@/types/plan";

export function useAdminPlans() {
  const { data, ...query } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await planService.getPlans();
      const raw = response.data;

      if (Array.isArray(raw)) return raw;

      // Handle common API response wrapping
      const dataKey = Object.keys(raw).find((key) =>
        Array.isArray((raw as any)[key]),
      );

      return (dataKey ? (raw as any)[dataKey] : []) as Plan[];
    },
  });

  return {
    ...query,
    plans: data || [],
  };
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlanCreateInput) => planService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<PlanCreateInput>;
    }) => planService.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => planService.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}
