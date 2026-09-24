"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { auditService } from "@/services/audit-service";
import { AuditLog, ACTION_LABELS, RESOURCE_LABELS } from "@/types/audit-log";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-PT", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const ACTION_COLORS: Record<string, string> = {
  USER_CREATED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  USER_UPDATED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  USER_PASSWORD_RESET: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  DOCUMENT_APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  DOCUMENT_REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  DOCUMENT_SUBMITTED: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  DOCUMENT_CREATED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  ADMIN_DEPLOY_SYNC: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  LOGIN: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function AuditLogsContent() {
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filters, setFilters] = useState({ action: "", resource: "" });

  const { data: summary } = useQuery({
    queryKey: ["audit-summary"],
    queryFn: auditService.getSummary,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["audit-logs", page, filters],
    queryFn: () =>
      auditService.list({
        page,
        limit: 20,
        action: filters.action || undefined,
        resource: filters.resource || undefined,
      }),
  });

  const logs = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-card p-4 space-y-1">
            <p className="text-sm text-muted-foreground">Total de Eventos</p>
            <p className="text-2xl font-bold">{summary.totalEvents.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 space-y-1">
            <p className="text-sm text-muted-foreground">Logins (24h)</p>
            <p className="text-2xl font-bold text-emerald-600">{summary.recentLogins}</p>
          </div>
          {summary.byResource.slice(0, 2).map((r) => (
            <div key={r.resource} className="rounded-xl border bg-card p-4 space-y-1">
              <p className="text-sm text-muted-foreground">{RESOURCE_LABELS[r.resource] || r.resource}</p>
              <p className="text-2xl font-bold">{r._count.id}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          value={filters.action}
          onChange={(e) => { setFilters((f) => ({ ...f, action: e.target.value })); setPage(1); }}
          placeholder="Filtrar por ação..."
          className="h-9 w-56 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <select
          value={filters.resource}
          onChange={(e) => { setFilters((f) => ({ ...f, resource: e.target.value })); setPage(1); }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Todos os recursos</option>
          {Object.entries(RESOURCE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center">
          <p className="text-destructive font-medium">Erro ao carregar logs</p>
          <button onClick={() => refetch()} className="mt-2 text-sm underline text-muted-foreground">Tentar novamente</button>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ação</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Recurso</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Utilizador</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">IP</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Nenhum evento registado
                  </td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${ACTION_COLORS[log.action] || "bg-muted text-muted-foreground"}`}>
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {RESOURCE_LABELS[log.resource] || log.resource}
                  </td>
                  <td className="px-4 py-3">
                    {log.user?.name || log.userEmail || <span className="text-muted-foreground italic">Sistema</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {log.ipAddress || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {log.details && (
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-xs underline text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Ver detalhes
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{meta.total} eventos</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 rounded border hover:bg-muted disabled:opacity-50">Anterior</button>
            <span className="px-3 py-1">{page} / {meta.totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages} className="px-3 py-1 rounded border hover:bg-muted disabled:opacity-50">Próxima</button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedLog(null)}>
          <div className="relative w-full max-w-lg rounded-xl border bg-card shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Detalhes do Evento</h2>
              <button onClick={() => setSelectedLog(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Ação</span><span className="font-medium">{ACTION_LABELS[selectedLog.action] || selectedLog.action}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Recurso</span><span>{RESOURCE_LABELS[selectedLog.resource] || selectedLog.resource}</span></div>
              {selectedLog.resourceId && <div className="flex justify-between"><span className="text-muted-foreground">ID do Recurso</span><span className="font-mono text-xs">{selectedLog.resourceId}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Data</span><span>{formatDate(selectedLog.createdAt)}</span></div>
              {selectedLog.ipAddress && <div className="flex justify-between"><span className="text-muted-foreground">IP</span><span className="font-mono text-xs">{selectedLog.ipAddress}</span></div>}
            </div>
            {selectedLog.details && (
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Payload</p>
                <pre className="rounded-lg bg-muted p-3 text-xs overflow-auto max-h-48">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
