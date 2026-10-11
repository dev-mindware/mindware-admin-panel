"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Button, ButtonOnlyAction, DonutPanel, FilterToolbar, GaugePanel, Icon, MetricGrid, StatusBadge, TitleList, ToneBadge, type Column } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useQueryState } from "nuqs";
import { useDebounce } from "use-debounce";
import { AdminTable } from "@/components/admin/shared/admin-table";
import { PermissionGate } from "@/components/admin/shared/permission-gate";
import { SUBSCRIPTION_STATUS } from "@/constants/statuses";
import { SUBSYSTEM_LABEL } from "@/constants/labels";
import { useSchoolStats, useSchools } from "@/hooks/directory/use-directory";
import { slicesFromCounts } from "@/utils/charts";
import { day } from "@/utils/format";
import type { AdminSchool } from "@/types/directory";
import { ONBOARD_MODAL, OnboardModal } from "./onboard-modal";

const ACTIVATION_TONE = { completa: "success", em_curso: "info", parada: "danger" } as const;
const ACTIVATION_LABEL = { completa: "Completo", em_curso: "Em curso", parada: "Parado" } as const;

/** Escolas clientes: KPIs, lista com estado comercial, arranque e último acesso, e o assistente «Nova escola». */
export function SchoolsPageContent() {
  const stats = useSchoolStats();
  const router = useRouter();
  const { openModal } = useModalStore();
  const [q, setQ] = useQueryState("q", { defaultValue: "" });
  const [status, setStatus] = useQueryState("status", { defaultValue: "" });
  const [dq] = useDebounce(q, 350);
  const list = useSchools({ ...(dq.length >= 2 ? { q: dq } : {}), ...(status ? { status } : {}) });
  const s = stats.data;

  const columns: Column<AdminSchool>[] = [
    {
      key: "name",
      header: "Escola",
      render: (_, x) => (
        <Link href={`/schools/${x.id}`} className="block hover:underline">
          <p className="font-medium">{x.name}</p>
          <p className="text-xs text-muted-foreground">NIF {x.nif}{x.med_code ? ` · MED ${x.med_code}` : ""} · {SUBSYSTEM_LABEL[x.subsystem] ?? x.subsystem}</p>
        </Link>
      ),
    },
    {
      key: "subscription",
      header: "Subscrição",
      render: (_, x) =>
        x.subscription ? (
          <div className="space-y-0.5">
            <StatusBadge status={x.subscription.status} map={SUBSCRIPTION_STATUS} />
            <p className="text-xs text-muted-foreground">{x.subscription.plan.name}{x.subscription.days_left !== null ? ` · ${x.subscription.days_left} dia(s)` : ""}</p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Sem subscrição</span>
        ),
    },
    {
      key: "activation",
      header: "Arranque",
      render: (_, x) => (
        <div className="min-w-[130px] space-y-1">
          <div className="flex items-center justify-between gap-2">
            <ToneBadge tone={ACTIVATION_TONE[x.activation.status]} label={ACTIVATION_LABEL[x.activation.status]} className="text-[10px]" />
            <span className="text-xs text-muted-foreground">{x.activation.done}/{x.activation.total}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded bg-muted"><div className="h-full bg-primary" style={{ width: `${x.activation.percent}%` }} /></div>
          {x.activation.next_step && x.activation.status !== "completa" && <p className="truncate text-[11px] text-muted-foreground">Falta: {x.activation.next_step.label}</p>}
        </div>
      ),
    },
    { key: "usage", header: "Utilização", render: (_, x) => <span className="text-xs">{x.usage.students} alunos · {x.usage.internal_users} utilizadores</span> },
    {
      key: "titular",
      header: "Titular",
      render: (_, x) =>
        x.titular ? (
          <div className="text-xs">
            <p className="font-medium">{x.titular.full_name}</p>
            <p className="text-muted-foreground">{x.titular.email}</p>
            {!x.titular.mfa_enabled && <Badge variant="pending" className="mt-0.5 text-[10px]">Sem 2FA</Badge>}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    { key: "last_login_at", header: "Último acesso", render: (_, x) => <span className="text-xs">{x.last_login_at ? day(x.last_login_at) : "nunca"}</span> },
    { key: "actions", header: "Acção", render: (_, x) => <ButtonOnlyAction data={x} actions={[{ label: "Abrir ficha", icon: "ExternalLink", onClick: (r) => router.push(`/schools/${r.id}`) }]} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <TitleList title="Escolas" suTitle="Todas as escolas clientes, o estado comercial de cada uma e o progresso do arranque.">
        <PermissionGate permission="school:create">
          <Button size="sm" className="gap-2" onClick={() => openModal(ONBOARD_MODAL)}>
            <Icon name="Plus" className="size-4" />
            Nova escola
          </Button>
        </PermissionGate>
      </TitleList>

      <MetricGrid
        isLoading={stats.isLoading}
        isError={stats.isError}
        onRetry={() => void stats.refetch()}
        items={
          s
            ? [
                { title: s.total, subtitle: "Escolas", description: `${s.new_month} nova(s) este mês`, icon: "School" },
                { title: s.by_status.active, subtitle: "A pagar", description: "Subscrição activa", icon: "CircleCheck" },
                { title: s.by_status.trial, subtitle: "Em teste", description: `${s.no_subscription} sem subscrição`, icon: "FlaskConical" },
                { title: s.activation.stalled, subtitle: "Arranque parado", description: `${s.activation.incomplete} com arranque por concluir`, icon: "TriangleAlert", variant: s.activation.stalled > 0 ? "action" : "default", colors: "destructive" },
              ]
            : []
        }
        skeletons={4}
      />

      {s && (
        <div className="grid gap-4 md:grid-cols-2">
          <DonutPanel title="Escolas por estado" description="Estado comercial de todas as escolas" icon="ChartPie" centerLabel="escolas" slices={slicesFromCounts({ ...s.by_status, none: s.no_subscription }, { ...Object.fromEntries(Object.entries(SUBSCRIPTION_STATUS).map(([k, v]) => [k, v.label])), none: "Sem subscrição" })} />
          <GaugePanel title="Arranque concluído" description="Escolas com o arranque completo" icon="Rocket" percent={s.total ? ((s.total - s.activation.incomplete) / s.total) * 100 : null} caption={`${s.activation.incomplete} por concluir · ${s.activation.stalled} parada(s)`} warnBelow={50} />
        </div>
      )}

      <div className="space-y-4">
        <FilterToolbar
          search={{ value: q, onChange: (v) => void setQ(v), placeholder: "Pesquisar por nome, NIF ou código MED…" }}
          filters={[{ key: "status", label: "Estado comercial", value: status, onChange: (v) => void setStatus(v), options: Object.entries(SUBSCRIPTION_STATUS).map(([value, x]) => ({ value, label: x.label })) }]}
          onClear={() => { void setQ(""); void setStatus(""); }}
        />
        <AdminTable list={list} columns={columns} emptyTitle="Nenhuma escola encontrada" emptyDescription="Nenhuma escola corresponde à pesquisa." emptyIcon="School" />
      </div>

      <OnboardModal />
    </div>
  );
}
