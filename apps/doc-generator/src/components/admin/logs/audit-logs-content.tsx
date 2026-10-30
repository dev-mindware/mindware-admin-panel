"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  DetailRow,
  DynamicDrawer,
  FilterToolbar,
  GenericTable,
  ListSkeleton,
  MetricGrid,
  PageWrapper,
  RequestError,
  TitleList,
  ToneBadge,
  Button,
  type Column,
  type Tone,
} from "@workspace/ui";
import { auditService } from "@/services/audit-service";
import { formatFullDateTime } from "@/lib/format";
import { ACTION_LABELS, RESOURCE_LABELS, type AuditLog } from "@/types/audit-log";

const ACTION_TONE: Record<string, Tone> = {
  USER_CREATED: "info",
  USER_UPDATED: "warning",
  USER_PASSWORD_RESET: "warning",
  DOCUMENT_APPROVED: "success",
  DOCUMENT_REJECTED: "danger",
  DOCUMENT_SUBMITTED: "info",
  DOCUMENT_CREATED: "info",
  ADMIN_DEPLOY_SYNC: "warning",
  LOGIN: "neutral",
};

export function AuditLogsContent() {
  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    action: parseAsString.withDefault(""),
    resource: parseAsString.withDefault(""),
  });
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const summary = useQuery({ queryKey: ["audit-summary"], queryFn: auditService.getSummary });
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () =>
      auditService.list({
        page: params.page,
        limit: 20,
        action: params.action || undefined,
        resource: params.resource || undefined,
      }),
  });

  const columns: Column<AuditLog>[] = [
    {
      key: "action",
      header: "Acção",
      render: (v: string) => <ToneBadge label={ACTION_LABELS[v] ?? v} tone={ACTION_TONE[v] ?? "neutral"} />,
    },
    { key: "resource", header: "Recurso", render: (v: string) => RESOURCE_LABELS[v] ?? v },
    { key: "user", header: "Utilizador", render: (_, l) => l.user?.name || l.userEmail || "Sistema" },
    { key: "ipAddress", header: "IP", render: (v) => v || "—" },
    { key: "createdAt", header: "Data", render: (v: string) => formatFullDateTime(v) },
    {
      key: "details",
      header: "Detalhes",
      render: (v, l) =>
        v ? (
          <Button variant="ghost" size="sm" onClick={() => setSelected(l)}>
            Ver detalhes
          </Button>
        ) : null,
    },
  ];

  const s = summary.data;
  const meta = data?.meta;

  return (
    <PageWrapper routeLabel="Administração" subRoute="Logs de Auditoria">
      <TitleList
        title="Logs de Auditoria"
        suTitle="Registo imutável das acções realizadas no sistema: utilizadores, documentos, sessões e sincronizações"
      />

      <MetricGrid
        isLoading={summary.isLoading}
        isError={summary.isError}
        onRetry={() => void summary.refetch()}
        items={
          s
            ? [
                { title: s.totalEvents.toLocaleString("pt-PT"), subtitle: "Total de eventos", icon: "ClipboardList" },
                { title: s.recentLogins, subtitle: "Sessões (24 h)", icon: "LogIn" },
                ...s.byResource.slice(0, 2).map((r) => ({
                  title: r._count.id,
                  subtitle: RESOURCE_LABELS[r.resource] ?? r.resource,
                  icon: "Activity" as const,
                })),
              ]
            : []
        }
      />

      <FilterToolbar
        search={{
          value: params.action,
          onChange: (v) => void setParams({ action: v || null, page: 1 }),
          placeholder: "Filtrar por acção…",
        }}
        filters={[
          {
            key: "resource",
            label: "Recurso",
            value: params.resource,
            onChange: (v) => void setParams({ resource: v || null, page: 1 }),
            options: Object.entries(RESOURCE_LABELS).map(([value, label]) => ({ value, label })),
            placeholder: "Todos os recursos",
          },
        ]}
        onClear={() => void setParams({ action: null, resource: null, page: 1 })}
      />

      {isError ? (
        <RequestError refetch={() => void refetch()} message="Não foi possível carregar os registos." />
      ) : isLoading ? (
        <ListSkeleton cols={6} rows={6} />
      ) : (
        <GenericTable<AuditLog>
          data={data?.data ?? []}
          columns={columns}
          emptyTitle="Nenhum evento registado"
          emptyDescription="Ajuste os filtros para ver outros eventos."
          emptyIcon="ClipboardList"
          page={params.page}
          total={meta?.total ?? 0}
          totalPages={meta?.totalPages ?? 1}
          setPage={(p) => void setParams({ page: p })}
          goToNextPage={() => void setParams({ page: Math.min(meta?.totalPages ?? 1, params.page + 1) })}
          goToPreviousPage={() => void setParams({ page: Math.max(1, params.page - 1) })}
        />
      )}

      <DynamicDrawer
        open={selected !== null}
        onOpenChange={(v) => !v && setSelected(null)}
        side="right"
        title="Detalhes do Evento"
        description={selected ? (ACTION_LABELS[selected.action] ?? selected.action) : undefined}
      >
        {selected && (
          <>
            <DetailRow label="Recurso" value={RESOURCE_LABELS[selected.resource] ?? selected.resource} />
            <DetailRow label="ID do recurso" value={selected.resourceId ?? undefined} />
            <DetailRow label="Data" value={formatFullDateTime(selected.createdAt)} />
            <DetailRow label="IP" value={selected.ipAddress ?? undefined} />
            <pre>{JSON.stringify(selected.details, null, 2)}</pre>
          </>
        )}
      </DynamicDrawer>
    </PageWrapper>
  );
}
