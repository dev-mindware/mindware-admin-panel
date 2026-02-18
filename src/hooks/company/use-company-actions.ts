"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { companyService } from "@/services/company-service";
import { Company } from "@/types";
import { useModal } from "@/stores/modal/use-modal-store";
import { toast } from "sonner";

export function useCompanyActions() {
  const queryClient = useQueryClient();
  const { openModal } = useModal();

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => companyService.toggleCompanyStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Estado da empresa atualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar o estado da empresa");
    },
  });

  const openViewDetails = (company: Company) => {
    openModal("view-company-details", company);
  };

  return {
    toggleStatus: (id: string) => toggleStatusMutation.mutate(id),
    isToggling: toggleStatusMutation.isPending,
    openViewDetails,
  };
}
