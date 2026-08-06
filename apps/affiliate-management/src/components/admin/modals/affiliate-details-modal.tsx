"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Checkbox,
  DetailRow,
  Field,
  FieldLabel,
  FieldContent,
  GlobalModal,
  Icon,
  ItemStatusBadge,
  Separator,
  Textarea,
} from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { Affiliate, AffiliateStatus } from "@workspace/types/affiliate";
import { formatCurrency, formatDate } from "@workspace/utils";
import { useUpdateAffiliateStatus } from "@/hooks/affiliate";
import {
  useAffiliateProgramSummary,
  useApproveCertification,
  useRejectCertification,
} from "@/hooks/affiliate/use-partner-program";
import { toast } from "sonner";

const levelLabels: Record<string, string> = {
  none: "Sem nível",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  elite: "Elite",
};

const certificationLabels: Record<string, string> = {
  not_eligible: "Não elegível",
  eligible: "Elegível",
  approved: "Certificado",
  rejected: "Rejeitado",
};

const partnerTypeLabels: Record<string, string> = {
  affiliate: "Afiliado",
  certified_commercial: "Parceiro Comercial Certificado",
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

export function AffiliateDetailsModal() {
  const { modalData, openModal, closeModal } = useModalStore();
  const affiliate = modalData["view-affiliate-details"] as Affiliate | undefined;

  const { mutate: updateStatus, isPending: isStatusPending } = useUpdateAffiliateStatus();
  const { mutate: approveCertification, isPending: isApproving } = useApproveCertification();
  const { mutate: rejectCertification, isPending: isRejecting } = useRejectCertification();
  const { data: summary, isLoading: isSummaryLoading } = useAffiliateProgramSummary(affiliate?.id);

  const [notes, setNotes] = useState("");
  const [force, setForce] = useState(false);

  if (!affiliate) return null;

  const certStatus = summary?.certification_status ?? affiliate.certification_status ?? "not_eligible";
  const partnerLevel = summary?.partner_level ?? affiliate.partner_level ?? "none";
  const partnerType = summary?.partner_type ?? affiliate.partner_type ?? "affiliate";
  const isEligible = certStatus === "eligible";
  const isApproved = certStatus === "approved";
  const activeClients = summary?.active_clients ?? 0;
  const canCertify = isEligible || force || isApproved;

  const handleStatus = (status: AffiliateStatus) => {
    updateStatus(
      { id: affiliate.id, status },
      {
        onSuccess: () => {
          toast.success("Estado do afiliado atualizado.");
          closeModal("view-affiliate-details");
        },
        onError: (error: any) => toast.error(error.response?.data?.detail || "Erro ao atualizar o estado."),
      },
    );
  };

  const handleApproveCertification = () => {
    approveCertification(
      { affiliateId: affiliate.id, notes: notes || undefined, force },
      {
        onSuccess: () => {
          toast.success("Certificação aprovada. O afiliado passa a ser Parceiro Comercial Certificado (PRO).");
          setNotes("");
          setForce(false);
        },
        onError: (error: any) =>
          toast.error(error.response?.data?.detail || error.response?.data?.message || "Erro ao aprovar certificação."),
      },
    );
  };

  const handleRejectCertification = () => {
    rejectCertification(
      { affiliateId: affiliate.id, notes: notes || undefined },
      {
        onSuccess: () => {
          toast.success("Certificação rejeitada.");
          setNotes("");
          setForce(false);
        },
        onError: (error: any) =>
          toast.error(error.response?.data?.detail || error.response?.data?.message || "Erro ao rejeitar certificação."),
      },
    );
  };

  return (
    <GlobalModal id="view-affiliate-details" title="Detalhes do afiliado" className="sm:max-w-[640px]">
      <div className="max-h-[70vh] space-y-6 overflow-y-auto py-2 pr-1">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Icon name="User" className="size-4 text-primary" />
              {affiliate.nome_completo}
            </h3>
            <p className="text-sm text-muted-foreground">{affiliate.email}</p>
          </div>
          <ItemStatusBadge status={affiliate.status} />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium text-primary">
              <Icon name="Contact" className="size-4" />
              Contacto
            </h4>
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <DetailRow label="Telefone" value={affiliate.telefone || "Sem telefone"} />
              <DetailRow label="Código" value={affiliate.codigo_afiliado || "N/A"} />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium text-primary">
              <Icon name="Building" className="size-4" />
              Dados bancários
            </h4>
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <DetailRow label="Banco" value={affiliate.banco || "Sem banco"} />
              <DetailRow label="Conta/IBAN" value={affiliate.conta_bancaria || "Sem conta"} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-medium text-primary">
            <Icon name="TrendingUp" className="size-4" />
            Performance financeira
          </h4>
          <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/30 p-3 md:grid-cols-3">
            <DetailRow label="Ganhos totais" value={formatCurrency(affiliate.total_earned)} />
            <DetailRow label="Total pago" value={formatCurrency(affiliate.total_paid)} />
            <DetailRow label="Saldo" value={formatCurrency(affiliate.total_earned - affiliate.total_paid)} />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-medium text-primary">
            <Icon name="Award" className="size-4" />
            Mindgest Partners Program
          </h4>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{partnerTypeLabels[partnerType] ?? partnerType}</Badge>
            <Badge variant="outline">Nível: {levelLabels[partnerLevel] ?? partnerLevel}</Badge>
            <Badge variant={certificationBadgeVariant(certStatus)}>
              {certificationLabels[certStatus] ?? certStatus}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/30 p-3 md:grid-cols-3">
            <DetailRow label="Clientes ativos" value={isSummaryLoading ? "…" : String(activeClients)} />
            <DetailRow
              label="Faltam p/ próximo nível"
              value={isSummaryLoading ? "…" : summary?.next_level ? String(summary.clients_to_next_level) : "—"}
            />
            <DetailRow
              label="Bónus recorrente"
              value={isSummaryLoading ? "…" : `${summary?.recurring_bonus_percent ?? 0}%`}
            />
          </div>

          {!isApproved && !isEligible && (
            <p className="text-xs text-muted-foreground">
              O afiliado ainda não é elegível (requer 15 clientes ativos). Use o override de administrador para certificar
              manualmente.
            </p>
          )}

          <Field>
            <FieldLabel>Notas (opcional)</FieldLabel>
            <FieldContent>
              <Textarea
                placeholder="Observações sobre a decisão de certificação…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[70px]"
              />
            </FieldContent>
          </Field>

          {!isApproved && !isEligible && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={force} onCheckedChange={(v) => setForce(Boolean(v))} />
              <span>Forçar certificação (override de administrador, ignora os 15 clientes)</span>
            </label>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            {!isApproved && (
              <Button loading={isApproving} disabled={!canCertify} onClick={handleApproveCertification}>
                Certificar (PRO)
              </Button>
            )}
            {(isApproved || isEligible || certStatus === "not_eligible") && (
              <Button variant="destructive" loading={isRejecting} onClick={handleRejectCertification}>
                {isApproved ? "Revogar certificação" : "Rejeitar certificação"}
              </Button>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-medium text-primary">
            <Icon name="Settings" className="size-4" />
            Ações administrativas
          </h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              onClick={() => {
                closeModal("view-affiliate-details");
                openModal("register-subscription-payment", affiliate);
              }}
            >
              Atribuir subscrição Mindgest
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                closeModal("view-affiliate-details");
                openModal("create-lead", affiliate);
              }}
            >
              Atribuir lead Mindgest
            </Button>
            {affiliate.status === AffiliateStatus.PENDING_APPROVAL && (
              <>
                <Button loading={isStatusPending} onClick={() => handleStatus(AffiliateStatus.ACTIVE)}>
                  Aprovar afiliado
                </Button>
                <Button
                  variant="destructive"
                  loading={isStatusPending}
                  onClick={() => handleStatus(AffiliateStatus.REJECTED)}
                >
                  Rejeitar
                </Button>
              </>
            )}
            {affiliate.status === AffiliateStatus.ACTIVE && (
              <Button variant="outline" loading={isStatusPending} onClick={() => handleStatus(AffiliateStatus.SUSPENDED)}>
                Suspender conta
              </Button>
            )}
            {(affiliate.status === AffiliateStatus.SUSPENDED || affiliate.status === AffiliateStatus.INACTIVE) && (
              <Button loading={isStatusPending} onClick={() => handleStatus(AffiliateStatus.ACTIVE)}>
                Reativar conta
              </Button>
            )}
            <div className="ml-auto text-xs text-muted-foreground">
              Aderiu em {formatDate(affiliate.created_at)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end border-t pt-4">
        <Button variant="outline" onClick={() => closeModal("view-affiliate-details")}>
          Fechar
        </Button>
      </div>
    </GlobalModal>
  );
}
