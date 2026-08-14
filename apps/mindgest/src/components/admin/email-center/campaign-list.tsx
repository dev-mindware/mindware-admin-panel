"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEmailCampaigns, useDeleteCampaign, useSendCampaignNow } from "@/hooks/email-center";
import {
  GenericTable,
  Column,
  ListSkeleton,
  RequestError,
  ItemStatusBadge,
  ButtonOnlyAction,
  ConfirmModal,
} from "@/components";
import { CONFIRM_MODAL_ID } from "@/components/custom/confirm-modal";
import { useModal } from "@/stores/modal/use-modal-store";
import type { EmailCampaign, CampaignStatus } from "@/types";
import { formatDateTime } from "@/utils";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  BILLING: "Cobrança",
  MARKETING: "Marketing",
  PUBLICITY: "Publicidade",
};

const STATUS_MAP: Record<CampaignStatus, string> = {
  DRAFT: "Rascunho",
  SCHEDULED: "Agendada",
  SENDING: "A Enviar",
  SENT: "Enviada",
  CANCELLED: "Cancelada",
  FAILED: "Falhou",
};

export function CampaignList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data: campaigns, isLoading, isError, refetch } = useEmailCampaigns();
  const { mutateAsync: deleteCampaign } = useDeleteCampaign();
  const { mutateAsync: sendNow } = useSendCampaignNow();
  const { openModal } = useModal();

  const columns: Column<EmailCampaign>[] = [
    {
      key: "name",
      header: "Campanha",
      render: (_, item) => (
        <div>
          <div className="font-medium text-foreground">{item.name}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
            {item.subject}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tipo",
      render: (_, item) => (
        <span className="text-sm text-foreground">
          {CAMPAIGN_TYPE_LABELS[item.type] ?? item.type}
        </span>
      ),
    },
    {
      key: "totalRecipients",
      header: "Destinatários",
      render: (_, item) => (
        <span className="tabular-nums">{item.totalRecipients.toLocaleString("pt-AO")}</span>
      ),
    },
    {
      key: "totalSent",
      header: "Enviados",
      render: (_, item) => (
        <span className="tabular-nums">
          {item.totalSent > 0 ? item.totalSent.toLocaleString("pt-AO") : "—"}
        </span>
      ),
    },
    {
      key: "totalOpened",
      header: "Abertura",
      render: (_, item) => {
        const rate = item.totalSent > 0
          ? ((item.totalOpened / item.totalSent) * 100).toFixed(1)
          : null;
        return (
          <span className="tabular-nums">
            {rate !== null ? `${rate}%` : "—"}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => (
        <ItemStatusBadge status={STATUS_MAP[item.status] ?? item.status} />
      ),
    },
    {
      key: "createdAt",
      header: "Criada em",
      render: (_, item) => (
        <div className="text-sm text-foreground">{formatDateTime(item.createdAt)}</div>
      ),
    },
    {
      key: "action",
      header: "Ação",
      render: (_, item) => {
        const actions: any[] = [
          {
            label: "Ver Analytics",
            icon: "ChartBar",
            onClick: (data: EmailCampaign) =>
              router.push(`/email-marketing/campaigns/${data.id}/analytics`),
          },
        ];

        if (item.status === "DRAFT" || item.status === "SCHEDULED") {
          actions.push({
            label: "Editar",
            icon: "Pencil",
            onClick: (data: EmailCampaign) =>
              router.push(`/email-marketing/campaigns/${data.id}/edit`),
          });
          actions.push({ type: "separator" });
          actions.push({
            label: "Enviar Agora",
            icon: "Send",
            onClick: (data: EmailCampaign) => {
              openModal(CONFIRM_MODAL_ID, {
                title: "Confirmar envio de campanha",
                description: `Esta ação enviará a campanha "${data.name}" para todos os destinatários elegíveis.`,
                confirmLabel: "Enviar Campanha",
                loadingLabel: "A enviar...",
                onConfirm: async () => {
                  try {
                    const res = await sendNow(data.id);
                    SucessMessage(`Campanha enviada: ${res.data.sent} emails despachados.`);
                  } catch (error: any) {
                    ErrorMessage(error?.response?.data?.message || "Erro ao enviar campanha");
                    throw error;
                  }
                },
              });
            },
          });
        }

        if (item.status === "FAILED") {
          actions.push({

            label: "Tentar Novamente (Retry)",
            icon: "RotateCcw",
            onClick: (data: EmailCampaign) => {
              openModal(CONFIRM_MODAL_ID, {
                title: "Tentar reenvio de campanha",
                description: `Esta ação tentará novamente o disparo da campanha "${data.name}".`,
                confirmLabel: "Tentar Novamente",
                loadingLabel: "A reprocessar...",
                onConfirm: async () => {
                  try {
                    const res = await sendNow(data.id);
                    SucessMessage(`Reenvio concluído: ${res.data.sent} emails despachados.`);
                  } catch (error: any) {
                    ErrorMessage(error?.response?.data?.message || "Erro ao tentar reenviar a campanha");
                    throw error;
                  }
                },
              });
            },
          });
        }


        if (item.status !== "SENDING" && item.status !== "SENT") {
          actions.push({ type: "separator" });
          actions.push({
            label: "Eliminar",
            icon: "Trash2",
            variant: "destructive",
            onClick: (data: EmailCampaign) => {
              openModal(CONFIRM_MODAL_ID, {
                title: "Tem a certeza?",
                description: `A campanha "${data.name}" será permanentemente removida.`,
                confirmLabel: "Eliminar Campanha",
                loadingLabel: "A eliminar...",
                destructive: true,
                onConfirm: async () => {
                  try {
                    await deleteCampaign(data.id);
                    SucessMessage("Campanha eliminada com sucesso!");
                  } catch (error: any) {
                    ErrorMessage(error?.response?.data?.message || "Erro ao eliminar a campanha");
                    throw error;
                  }
                },
              });
            },
          });
        }

        return <ButtonOnlyAction data={item} actions={actions} />;
      },
    },
  ];

  if (isLoading) return <ListSkeleton />;
  if (isError) {
    return (
      <RequestError refetch={refetch} message="Erro ao carregar campanhas de email" />
    );
  }

  const list = campaigns || [];

  return (
    <div className="space-y-4">
      <GenericTable<EmailCampaign>
        data={list}
        columns={columns}
        page={page}
        total={list.length}
        totalPages={Math.max(1, Math.ceil(list.length / 10))}
        setPage={setPage}
        goToNextPage={() => setPage((p) => Math.min(p + 1, Math.ceil(list.length / 10)))}
        goToPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
        emptyDescription="Nenhuma campanha encontrada. Crie a sua primeira campanha de email."
      />

      <ConfirmModal />
    </div>
  );
}
