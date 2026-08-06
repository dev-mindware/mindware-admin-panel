"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { companyService } from "@/services/company-service";
import { Company } from "@/types";
import { useModal } from "@/stores/modal/use-modal-store";
import { toast } from "sonner";

function extractErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: string | string[] } } })
      .response?.data?.message !== "undefined"
  ) {
    const message = (
      error as { response: { data: { message: string | string[] } } }
    ).response.data.message;
    return Array.isArray(message) ? message.join(", ") : message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

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

  const assignAffiliateMutation = useMutation({
    mutationFn: ({
      id,
      affiliateCode,
    }: {
      id: string;
      affiliateCode: string | null;
    }) => companyService.updateCompany(id, { affiliateCode }),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      const updated = response.data;
      // Refresh modal payload with latest company data when available
      if (updated?.id) {
        openModal("view-company-details", updated);
      }
      toast.success(
        variables.affiliateCode
          ? "Código de afiliado atualizado com sucesso"
          : "Código de afiliado removido com sucesso",
      );
    },
    onError: (error) => {
      toast.error(
        extractErrorMessage(error, "Erro ao atualizar o código de afiliado"),
      );
    },
  });

  const openViewDetails = (company: Company) => {
    openModal("view-company-details", company);
  };

  return {
    toggleStatus: (id: string) => toggleStatusMutation.mutate(id),
    isToggling: toggleStatusMutation.isPending,
    openViewDetails,
    assignAffiliateCode: (
      id: string,
      affiliateCode: string | null,
      options?: { onSuccess?: () => void },
    ) =>
      assignAffiliateMutation.mutate(
        { id, affiliateCode },
        { onSuccess: options?.onSuccess },
      ),
    assignAffiliateCodeAsync: (id: string, affiliateCode: string | null) =>
      assignAffiliateMutation.mutateAsync({ id, affiliateCode }),
    isAssigningAffiliate: assignAffiliateMutation.isPending,
  };
}
