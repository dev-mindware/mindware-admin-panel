import { Plan } from "@/types";
import { useFetch } from "@workspace/hooks";
import { api } from "@/services/api";

export function usePlans() {
  const {
    data: plans,
    error,
    isLoading,
    refetch,
  } = useFetch<Plan[]>("plans", "/plans", { api });
  return { plans: plans || [], error, isLoading, refetch };
}
