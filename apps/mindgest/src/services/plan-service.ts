import { api } from "./api";
import { Plan, PlanCreateInput } from "@/types/plan";

export const planService = {
  getPlans: async () => {
    return api.get<Plan[]>("/plans");
  },

  createPlan: async (data: PlanCreateInput) => {
    return api.post<Plan>("/plans", data);
  },

  updatePlan: async (id: string, data: Partial<PlanCreateInput>) => {
    return api.patch<Plan>(`/plans/${id}`, data);
  },

  deletePlan: async (id: string) => {
    return api.delete(`/plans/${id}`);
  },
};
