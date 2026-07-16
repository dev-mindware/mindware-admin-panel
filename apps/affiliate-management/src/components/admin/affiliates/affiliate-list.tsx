"use client";

import { useState } from "react";
import {
  useAffiliates,
  useApproveAffiliate,
  useRejectAffiliate,
  useUpdateAffiliateStatus,
} from "@/hooks/affiliate";
import {
  Badge,
  ButtonOnlyAction,
  Column,
  FilterBar,
  GenericTable,
  ItemStatusBadge,
  ListSkeleton,
  RequestError,
} from "@workspace/ui";
import { Affiliate, AffiliateStatus } from "@workspace/types/affiliate";
import { formatCurrency, formatDate } from "@workspace/utils";
import { useModalStore } from "@workspace/hooks";
import { useApproveCertification } from "@/hooks/affiliate/use-partner-program";
import { toast } from "sonner";
import { AffiliateFormModal } from "./affiliate-form-modal";
import { DeleteAffiliateModal } from "./delete-affiliate-modal";

const certificationLabels: Record<string, string> = {
  not_eligible: "Não elegível",
  eligible: "Elegível",
  approved: "Certificado",
  rejected: "Rejeitado",
};

function certificationBadgeVariant(status?: string) {
  switch (status) {
    case "approved":
      return "success" as const;
    case "eligible":
      return "default" as const;
    case "rejected":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

export function AffiliateList() {
  const [status, setStatus] = useState<AffiliateStatus | undefined>();
  const {
    data,
    isLoading,
    isError,
    refetch,
    page,
    total,
    totalPages,
    setPage,
    goToNextPage,
    goToPreviousPage,
  } = useAffiliates({ status });

  const { openModal } = useModalStore();
  const { mutate: updateStatus } = useUpdateAffiliateStatus();
  const { mutate: approveAffiliate } = useApproveAffiliate();
  const { mutate: rejectAffiliate } = useRejectAffiliate();
  const { mutate: approveCertification } = useApproveCertification();

  const columns: Column<Affiliate>[] = [
    {
      key: "nome_completo",
      header: "Nome",
      render: (_, item) => <div className="font-medium text-foreground">{item.nome_completo}</div>,
    },
    {
      key: "email",
      header: "Email/Telefone",
      render: (_, item) => (
        <div className="text-sm">
          <div className="text-foreground">{item.email}</div>
          <div className="text-muted-foreground">{item.telefone || "Sem telefone"}</div>
        </div>
      ),
    },
    {
      key: "codigo_afiliado",
      header: "Código",
      render: (_, item) => (
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
          {item.codigo_afiliado || "N/A"}
        </code>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => <ItemStatusBadge status={item.status} />,
    },
    {
      key: "certification_status",
      header: "Certificação",
      render: (_, item) => (
        <Badge variant={certificationBadgeVariant(item.certification_status)}>
          {certificationLabels[item.certification_status ?? "not_eligible"] ?? item.certification_status}
        </Badge>
      ),
    },
    {
      key: "total_earned",
      header: "Ganhos totais",
      render: (_, item) => <div className="text-sm font-medium">{formatCurrency(item.total_earned)}</div>,
    },
    {
      key: "createdAt",
      header: "Aderiu em",
      render: (_, item) => <div className="text-sm text-muted-foreground">{formatDate(item.created_at)}</div>,
    },
    {
      key: "action",
      header: "Ações",
      render: (_, item) => (
        <ButtonOnlyAction
          data={item}
          actions={[
            {
              label: "Ver detalhes",
              icon: "Info",
              onClick: (current) => openModal("view-affiliate-details", current),
            },
            {
              label: "Editar",
              icon: "Pencil",
              onClick: (current) => openModal("edit-affiliate", current),
            },
            ...(item.status === AffiliateStatus.PENDING_APPROVAL
              ? ([
                  {
                    label: "Aprovar afiliado",
                    icon: "CircleCheck",
                    onClick: (current: Affiliate) => approveAffiliate(current.id),
                  },
                  {
                    label: "Rejeitar afiliado",
                    icon: "CircleX",
                    variant: "destructive",
                    onClick: (current: Affiliate) => rejectAffiliate(current.id),
                  },
                ] as any)
              : []),
            ...(item.status === AffiliateStatus.INACTIVE || item.status === AffiliateStatus.SUSPENDED
              ? ([
                  {
                    label: "Ativar",
                    icon: "CirclePlay",
                    onClick: (current: Affiliate) =>
                      updateStatus({ id: current.id, status: AffiliateStatus.ACTIVE }),
                  },
                ] as any)
              : []),
            ...(item.status === AffiliateStatus.ACTIVE
              ? ([
                  {
                    label: "Suspender",
                    icon: "TriangleAlert",
                    variant: "destructive",
                    onClick: (current: Affiliate) =>
                      updateStatus({ id: current.id, status: AffiliateStatus.SUSPENDED }),
                  },
                ] as any)
              : []),
            ...(item.certification_status === "eligible"
              ? ([
                  {
                    label: "Certificar (PRO)",
                    icon: "Award",
                    onClick: (current: Affiliate) =>
                      approveCertification(
                        { affiliateId: current.id },
                        {
                          onSuccess: () => toast.success("Afiliado certificado como Parceiro Comercial (PRO)."),
                          onError: (error: any) =>
                            toast.error(error.response?.data?.detail || "Erro ao certificar afiliado."),
                        },
                      ),
                  },
                ] as any)
              : []),
            { type: "separator" },
            {
              label: "Eliminar",
              icon: "Trash2",
              variant: "destructive",
              onClick: (current) => openModal("delete-affiliate", current),
            },
          ]}
        />
      ),
    },
  ];

  if (isLoading) return <ListSkeleton />;

  if (isError) {
    return <RequestError refetch={refetch} message="Erro ao carregar afiliados." />;
  }

  return (
    <div className="space-y-4">
      <FilterBar
        label="Filtrar por estado"
        value={status || ""}
        onValueChange={(value) => setStatus((value || undefined) as AffiliateStatus | undefined)}
        options={[
          { label: "Pendente", value: AffiliateStatus.PENDING_APPROVAL },
          { label: "Ativo", value: AffiliateStatus.ACTIVE },
          { label: "Inativo", value: AffiliateStatus.INACTIVE },
          { label: "Suspenso", value: AffiliateStatus.SUSPENDED },
          { label: "Rejeitado", value: AffiliateStatus.REJECTED },
        ]}
      />

      <GenericTable<Affiliate>
        data={data || []}
        columns={columns}
        page={page}
        total={total}
        totalPages={totalPages}
        setPage={setPage}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
        emptyTitle="Nenhum afiliado encontrado"
        emptyDescription="Ainda não existem afiliados registados ou com este estado."
        emptyIcon="Users"
      />

      <AffiliateFormModal />
      <DeleteAffiliateModal />
    </div>
  );
}
