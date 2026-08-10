"use client";

import { useCompanyEmailHistory } from "@/hooks/email-center";
import { Skeleton } from "@/components";
import type { EmailLog, EmailLogStatus } from "@/types";
import { formatDateTime } from "@/utils";

const STATUS_ICON: Record<EmailLogStatus, { label: string; color: string }> = {
  QUEUED:    { label: "Na fila",  color: "text-muted-foreground" },
  SENT:      { label: "Enviado",  color: "text-muted-foreground" },
  DELIVERED: { label: "Entregue", color: "text-muted-foreground" },
  OPENED:    { label: "✓ Aberto", color: "text-primary" },
  CLICKED:   { label: "✓ Link clicado", color: "text-primary" },
  BOUNCED:   { label: "Bounce",   color: "text-destructive" },
  FAILED:    { label: "Falhou",   color: "text-destructive" },
};

function CommunicationEntry({ log }: { log: EmailLog }) {
  const statusInfo = STATUS_ICON[log.status] ?? { label: log.status, color: "text-muted-foreground" };
  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      <div className="w-1 shrink-0 rounded-full bg-primary/30 self-stretch" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground truncate">
              {log.campaign?.name ?? "Email Automático"}
            </p>
            <p className="text-xs text-muted-foreground">
              {log.campaign ? `Campanha de ${log.campaign.type === "BILLING" ? "Cobrança" : "Marketing"}` : "Automação de cobrança"}
            </p>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatDateTime(log.createdAt)}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-2">
          <span className={`text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          {log.convertedAt && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              ✓ Convertido
              {log.recoveredAmount ? ` — ${Number(log.recoveredAmount).toLocaleString("pt-AO")} Kz` : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface CompanyCommunicationsProps {
  companyId: string;
}

export function CompanyCommunications({ companyId }: CompanyCommunicationsProps) {
  const { data: logs, isLoading } = useCompanyEmailHistory(companyId);

  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Nenhuma comunicação registada para esta empresa.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {logs.map((log) => (
        <CommunicationEntry key={log.id} log={log} />
      ))}
    </div>
  );
}
