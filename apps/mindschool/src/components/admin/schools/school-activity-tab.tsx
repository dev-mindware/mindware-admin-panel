"use client";

import { Badge, Button, Panel, StatusBadge } from "@workspace/ui";
import { useQuery } from "@tanstack/react-query";
import { SEVERITY } from "@/constants/statuses";
import { ALERT_TYPE_LABEL } from "@/constants/labels";
import { useAcknowledge, useAudit } from "@/hooks/ops/use-ops";
import { securityService } from "@/services/ops-service";
import { dateTime } from "@/utils/format";

/** Alertas de segurança e actividade recente (auditoria) de uma escola. */
export function SchoolActivityTab({ schoolId }: { schoolId: string }) {
  const audit = useAudit({ schoolId });
  const alerts = useQuery({ queryKey: ["alerts", { schoolId }], queryFn: () => securityService.alerts({ schoolId }), staleTime: 30_000 });
  const ack = useAcknowledge();
  const open = (alerts.data ?? []).filter((a) => !a.acknowledged_at);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Alertas de segurança" icon="ShieldAlert" action={open.length > 0 ? <Badge variant="destructive">{open.length} por reconhecer</Badge> : undefined}>
        {(alerts.data ?? []).length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Sem alertas para esta escola.</p>
        ) : (
          <ul className="space-y-2">
            {(alerts.data ?? []).map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 rounded-md border p-2 text-sm">
                <div>
                  <p className="flex items-center gap-2 font-medium"><StatusBadge status={a.severity} map={SEVERITY} className="text-[10px]" />{ALERT_TYPE_LABEL[a.type] ?? a.type}</p>
                  <p className="text-[11px] text-muted-foreground">{dateTime(a.created_at)}{a.acknowledged_at ? ` · reconhecido ${dateTime(a.acknowledged_at)}` : ""}</p>
                </div>
                {!a.acknowledged_at && <Button size="sm" variant="outline" disabled={ack.isPending} onClick={() => ack.mutate(a.id)}>Reconhecer</Button>}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Actividade recente" description="Auditoria da escola (últimos 7 dias)" icon="History">
        {audit.isLoading && <p className="text-sm text-muted-foreground">A carregar…</p>}
        {!audit.isLoading && audit.all.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Sem actividade registada.</p>}
        <ul className="divide-y">
          {audit.all.slice(0, 40).map((e) => (
            <li key={e.id} className="flex items-start justify-between gap-3 py-1.5 text-sm">
              <div className="min-w-0">
                <p><span className="font-medium">{e.actor?.full_name ?? "Sistema"}</span> <span className="text-muted-foreground">{e.action} · {e.entity_type}</span></p>
                {e.reason && <p className="truncate text-[11px] text-muted-foreground">{e.reason}</p>}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{dateTime(e.occurred_at)}</span>
            </li>
          ))}
        </ul>
        {audit.hasMore && <div className="pt-2 text-center"><Button size="sm" variant="outline" loading={audit.isFetchingMore} onClick={audit.goToNextPage}>Ver mais</Button></div>}
      </Panel>
    </div>
  );
}
