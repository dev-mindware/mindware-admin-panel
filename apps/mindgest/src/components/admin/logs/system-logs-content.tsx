"use client";

import { useState } from "react";
import { useApplicationLogs, useAuditTrails } from "@/hooks/analytics/use-analytics";
import {
  GenericTable,
  Column,
  ListSkeleton,
  RequestError,
  ItemStatusBadge,
  ButtonOnlyAction,
  Icon,
} from "@/components";
import { formatDateTime } from "@/utils";
import { ApplicationLogItem, AuditTrailItem } from "@/services/analytics-service";

export function SystemLogsContent() {
  const [logType, setLogType] = useState<"application" | "audit">("application");

  // Application Logs filters & pagination
  const [appPage, setAppPage] = useState(1);
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [appSearch, setAppSearch] = useState<string>("");

  // Audit Logs filters & pagination
  const [auditPage, setAuditPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState<string>("ALL");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [auditSearch, setAuditSearch] = useState<string>("");

  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const {
    data: appData,
    isLoading: appLoading,
    isError: appError,
    refetch: refetchApp,
  } = useApplicationLogs(appPage, 10, levelFilter, appSearch);

  const {
    data: auditData,
    isLoading: auditLoading,
    isError: auditError,
    refetch: refetchAudit,
  } = useAuditTrails(auditPage, 10, entityFilter, actionFilter, auditSearch);

  // Application Logs Table Columns
  const appColumns: Column<ApplicationLogItem>[] = [
    {
      key: "timestamp",
      header: "Data / Hora",
      render: (val) => (
        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
          {formatDateTime(val)}
        </span>
      ),
    },
    {
      key: "level",
      header: "Nível",
      render: (val) => (
        <ItemStatusBadge status={val} />
      ),
    },
    {
      key: "route",
      header: "Rota / Método",
      render: (_, item) => (
        <div className="font-mono text-xs whitespace-nowrap">
          <span className="font-semibold text-foreground">{item.method || "GET"}</span>{" "}
          <span className="text-muted-foreground">{item.route || "/"}</span>
        </div>
      ),
    },
    {
      key: "statusCode",
      header: "Status",
      render: (val) => (
        <span
          className={`font-mono text-xs font-bold ${
            (val || 200) >= 500
              ? "text-destructive"
              : (val || 200) >= 400
              ? "text-amber-500"
              : "text-emerald-500"
          }`}
        >
          {val || 200}
        </span>
      ),
    },
    {
      key: "durationMs",
      header: "Duração",
      render: (val) => (
        <span className="text-xs font-mono text-muted-foreground">
          {val ? `${val} ms` : "—"}
        </span>
      ),
    },
    {
      key: "requestId",
      header: "Request ID",
      render: (val) => (
        <span className="text-[11px] font-mono text-muted-foreground">
          {val ? String(val).slice(0, 8) : "N/A"}
        </span>
      ),
    },
    {
      key: "message",
      header: "Mensagem",
      render: (val) => (
        <div className="text-xs font-sans text-foreground truncate max-w-xs" title={val}>
          {val}
        </div>
      ),
    },
    {
      key: "id",
      header: "Ações",
      render: (_, item) => (
        <ButtonOnlyAction
          data={item}
          actions={[
            {
              label: "Ver Detalhes",
              icon: "Eye",
              onClick: (data) => setSelectedLog(data),
            },
          ]}
        />
      ),
    },
  ];

  // Audit Logs Table Columns
  const auditColumns: Column<AuditTrailItem>[] = [
    {
      key: "createdAt",
      header: "Data / Hora",
      render: (val) => (
        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
          {formatDateTime(val)}
        </span>
      ),
    },
    {
      key: "action",
      header: "Ação",
      render: (val) => (
        <ItemStatusBadge status={val} />
      ),
    },
    {
      key: "entity",
      header: "Entidade",
      render: (val) => (
        <span className="text-xs font-semibold text-foreground font-mono">{val}</span>
      ),
    },
    {
      key: "userId",
      header: "Utilizador / Ator",
      render: (_, item) => (
        <div className="text-xs text-muted-foreground">
          {item.user?.name || item.user?.email || (item.userId ? item.userId.slice(0, 8) : "Sistema")}
        </div>
      ),
    },
    {
      key: "ipAddress",
      header: "IP Address",
      render: (val) => (
        <span className="text-xs font-mono text-muted-foreground">{val || "127.0.0.1"}</span>
      ),
    },
    {
      key: "id",
      header: "Ações",
      render: (_, item) => (
        <ButtonOnlyAction
          data={item}
          actions={[
            {
              label: "Ver Alterações",
              icon: "FileText",
              onClick: (data) => setSelectedLog(data),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Type Switcher Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        {/* Tab Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setLogType("application");
              setAppPage(1);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
              logType === "application"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon name="Terminal" className="w-4 h-4" />
            Application Logs (Técnico)
          </button>
          <button
            type="button"
            onClick={() => {
              setLogType("audit");
              setAuditPage(1);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
              logType === "audit"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon name="ShieldCheck" className="w-4 h-4" />
            Audit Logs (Rastreabilidade)
          </button>
        </div>

        {/* Filters for Application Logs */}
        {logType === "application" && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar rota, erro, requestId..."
                value={appSearch}
                onChange={(e) => {
                  setAppSearch(e.target.value);
                  setAppPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-48 sm:w-60"
              />
              <Icon name="Search" className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
            </div>

            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setAppPage(1);
              }}
              className="px-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">Todos os Níveis</option>
              <option value="ERROR">ERROR</option>
              <option value="WARN">WARN</option>
              <option value="INFO">INFO</option>
              <option value="FATAL">FATAL</option>
              <option value="DEBUG">DEBUG</option>
            </select>
          </div>
        )}

        {/* Filters for Audit Logs */}
        {logType === "audit" && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar utilizador, IP..."
                value={auditSearch}
                onChange={(e) => {
                  setAuditSearch(e.target.value);
                  setAuditPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-40 sm:w-48"
              />
              <Icon name="Search" className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
            </div>

            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setAuditPage(1);
              }}
              className="px-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">Todas as Entidades</option>
              <option value="USER">USER</option>
              <option value="INVOICE">INVOICE</option>
              <option value="COMPANY">COMPANY</option>
              <option value="SUBSCRIPTION">SUBSCRIPTION</option>
              <option value="TRANSACTION">TRANSACTION</option>
              <option value="ITEMS">ITEMS</option>
              <option value="CLIENT">CLIENT</option>
              <option value="STORE">STORE</option>
            </select>

            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setAuditPage(1);
              }}
              className="px-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">Todas as Ações</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGOUT">LOGOUT</option>
              <option value="SALE">SALE</option>
              <option value="REFUND">REFUND</option>
            </select>
          </div>
        )}
      </div>

      {/* ─── Application Logs Table with Server-Side Pagination ───────────────── */}
      {logType === "application" && (
        <>
          {appLoading ? (
            <ListSkeleton />
          ) : appError ? (
            <RequestError refetch={refetchApp} message="Erro ao carregar os logs de aplicação" />
          ) : (
            <GenericTable<ApplicationLogItem>
              data={appData?.data || []}
              columns={appColumns}
              page={appPage}
              total={appData?.total || 0}
              totalPages={appData?.totalPages || 1}
              setPage={setAppPage}
              goToNextPage={() => setAppPage((p) => Math.min(p + 1, appData?.totalPages || 1))}
              goToPreviousPage={() => setAppPage((p) => Math.max(p - 1, 1))}
              emptyDescription="Nenhum log de aplicação encontrado com os filtros selecionados."
            />
          )}
        </>
      )}

      {/* ─── Audit Logs Table with Server-Side Pagination ────────────────────── */}
      {logType === "audit" && (
        <>
          {auditLoading ? (
            <ListSkeleton />
          ) : auditError ? (
            <RequestError refetch={refetchAudit} message="Erro ao carregar os registos de auditoria" />
          ) : (
            <GenericTable<AuditTrailItem>
              data={auditData?.data || []}
              columns={auditColumns}
              page={auditPage}
              total={auditData?.total || 0}
              totalPages={auditData?.totalPages || 1}
              setPage={setAuditPage}
              goToNextPage={() => setAuditPage((p) => Math.min(p + 1, auditData?.totalPages || 1))}
              goToPreviousPage={() => setAuditPage((p) => Math.max(p - 1, 1))}
              emptyDescription="Nenhum registo de auditoria encontrado com os filtros selecionados."
            />
          )}
        </>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Icon name="Terminal" className="w-4 h-4 text-primary" />
                Detalhes do Registo de Log
              </h3>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto font-mono text-xs">
              <div className="p-3 rounded-lg bg-muted/40 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase font-sans">Mensagem / Evento</p>
                <p className="text-foreground font-medium mt-1">{selectedLog.message || selectedLog.action}</p>
              </div>

              {selectedLog.stackTrace && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                  <p className="text-[10px] uppercase font-sans font-bold">Stack Trace</p>
                  <pre className="text-[10px] whitespace-pre-wrap mt-1 overflow-x-auto">
                    {selectedLog.stackTrace}
                  </pre>
                </div>
              )}

              <div className="p-3 rounded-lg bg-muted/40 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase font-sans">Metadados / JSON Payload</p>
                <pre className="text-[10px] text-emerald-500 whitespace-pre-wrap mt-1 overflow-x-auto">
                  {JSON.stringify(selectedLog.metadata || selectedLog.newValues || selectedLog, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
