"use client";

import Link from "next/link";
import {
  Badge, Button, Icon, MetricGrid, Panel, Progress, ProofViewer, StatusBadge, Tabs, TabsContent, TabsList, TabsTrigger, TitleList, ToneBadge,
} from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useQueryState } from "nuqs";
import { OrderReviewModal, ORDER_REVIEW_MODAL, PROOF_MODAL } from "@/components/admin/subscriptions/order-review-modal";
import { SUBSCRIPTION_STATE_MODAL } from "@/components/admin/subscriptions/subscriptions-table";
import { SubscriptionStateModal } from "@/components/admin/subscriptions/subscription-state-modal";
import { ImpersonateModal } from "@/components/admin/users/impersonate-modal";
import { UserActionModal } from "@/components/admin/users/user-action-modal";
import { UsersTable } from "@/components/admin/users/users-table";
import { PermissionGate } from "@/components/admin/shared/permission-gate";
import { ORDER_KIND, ORDER_STATUS, SUBSCRIPTION_STATUS } from "@/constants/statuses";
import { SUBSYSTEM_LABEL } from "@/constants/labels";
import { useSchool } from "@/hooks/directory/use-directory";
import { subscriptionService } from "@/services/subscription-service";
import { dateTime, day, kz, ROLE_LABEL } from "@/utils/format";
import { SchoolActivityTab } from "./school-activity-tab";
import { SchoolEntitlementsTab } from "./school-entitlements-tab";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children || "—"}</dd>
    </div>
  );
}

/** Ficha da escola: resumo, subscrição, direitos, utilizadores e actividade, num só lugar. */
export function SchoolDetailContent({ schoolId }: { schoolId: string }) {
  const q = useSchool(schoolId);
  const { openModal } = useModalStore();
  const [tab, setTab] = useQueryState("tab", { defaultValue: "resumo" });

  if (q.isLoading) return <p className="p-6 text-sm text-muted-foreground">A carregar a ficha…</p>;
  if (q.isError || !q.data) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <Icon name="SearchX" className="size-10 text-muted-foreground" />
        <p className="font-medium">Escola não encontrada</p>
        <Button asChild variant="outline"><Link href="/schools">Voltar às escolas</Link></Button>
      </div>
    );
  }

  const { school, subscription: sub, orders, usage, titulars, activation } = q.data;
  const canSuspend = sub !== null && ["trial", "active", "past_due", "grace"].includes(sub.status);
  const canReactivate = sub?.status === "suspended";
  const target = { id: school.id, name: school.name };

  return (
    <div className="flex flex-col gap-6">
      <TitleList title={school.name} suTitle={`NIF ${school.nif}${school.med_code ? ` · MED ${school.med_code}` : ""} · ${SUBSYSTEM_LABEL[school.subsystem] ?? school.subsystem}`}>
        <div className="flex flex-wrap items-center gap-2">
          {sub && <StatusBadge status={sub.status} map={SUBSCRIPTION_STATUS} />}
          <PermissionGate permission="platform:subscription_manage">
            {canSuspend && <Button size="sm" variant="outline" className="gap-2" onClick={() => openModal(SUBSCRIPTION_STATE_MODAL, { school: target, action: "suspend" })}><Icon name="Pause" className="size-4" />Suspender</Button>}
            {canReactivate && <Button size="sm" className="gap-2" onClick={() => openModal(SUBSCRIPTION_STATE_MODAL, { school: target, action: "reactivate" })}><Icon name="Play" className="size-4" />Reactivar</Button>}
          </PermissionGate>
          <Button asChild size="sm" variant="outline"><Link href="/schools"><Icon name="ArrowLeft" className="mr-1.5 size-4" />Escolas</Link></Button>
        </div>
      </TitleList>

      <MetricGrid
        items={[
          { title: usage.students, subtitle: "Alunos", description: `${usage.sections} turma(s)`, icon: "GraduationCap" },
          { title: usage.teachers, subtitle: "Professores", description: `${usage.internal_users} utilizador(es) internos`, icon: "Presentation" },
                    { title: `${activation.done}/${activation.total}`, subtitle: "Arranque", description: activation.next_step ? `Falta: ${activation.next_step.label}` : "Completo", icon: "Rocket", variant: activation.status === "parada" ? "action" : "default", colors: "destructive" },
          { title: q.data.last_login_at ? day(q.data.last_login_at) : "nunca", subtitle: "Último acesso", description: `${activation.days_inactive} dia(s) sem actividade`, icon: "Clock" },
        ]}
      />

      <Tabs value={tab} onValueChange={(v) => void setTab(v)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="subscricao">Subscrição</TabsTrigger>
          <TabsTrigger value="direitos">Direitos</TabsTrigger>
          <TabsTrigger value="utilizadores">Utilizadores</TabsTrigger>
          <TabsTrigger value="actividade">Actividade e alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-4 pt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Dados da escola" icon="Building2">
              <dl className="grid grid-cols-2 gap-3">
                <Field label="Estado">{school.status}</Field>
                <Field label="Série fiscal">{school.fiscal_series_prefix}</Field>
                <Field label="Telefone">{school.phone}</Field>
                <Field label="Email">{school.email}</Field>
                <Field label="Morada">{school.address}</Field>
                <Field label="Criada em">{day(school.created_at)}</Field>
              </dl>
            </Panel>

            <Panel title="Titulares" icon="UserRound" description="Quem responde pela escola">
              {titulars.length === 0 ? <p className="text-sm text-muted-foreground">Sem Titular activo.</p> : (
                <ul className="space-y-2">
                  {titulars.map((t) => (
                    <li key={t.user_id} className="rounded-md border p-2 text-sm">
                      <p className="font-medium">{t.full_name}</p>
                      <p className="text-xs text-muted-foreground">{t.email}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <ToneBadge tone={t.mfa_enabled ? "success" : "warning"} label={t.mfa_enabled ? "2FA activo" : "Sem 2FA"} className="text-[10px]" />
                        <span className="text-[11px] text-muted-foreground">último acesso {t.last_login_at ? day(t.last_login_at) : "nunca"}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Papéis" icon="Users">
              <ul className="space-y-1 text-sm">
                {Object.entries(usage.roles).map(([r, n]) => <li key={r} className="flex justify-between"><span className="text-muted-foreground">{ROLE_LABEL[r] ?? r}</span><span className="font-semibold">{n}</span></li>)}
              </ul>
            </Panel>
          </div>

          <Panel title="Arranque da escola" description={`${activation.percent}% concluído`} icon="Rocket">
            <Progress value={activation.percent} className="mb-3 h-2" />
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {activation.items.map((i) => (
                <li key={i.key} className="flex items-start gap-2 text-sm">
                  <Icon name={i.done ? "CircleCheck" : "Circle"} className={`mt-0.5 size-4 shrink-0 ${i.done ? "text-green-600" : "text-muted-foreground"}`} />
                  <div><p className={i.done ? "" : "font-medium"}>{i.label}</p>{!i.done && <p className="text-xs text-muted-foreground">{i.hint}</p>}</div>
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="subscricao" className="space-y-4 pt-4">
          {sub ? (
            <Panel title="Subscrição" icon="Wallet">
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Field label="Plano">{sub.plan.name}</Field>
                <Field label="Estado"><StatusBadge status={sub.status} map={SUBSCRIPTION_STATUS} /></Field>
                <Field label={sub.status === "trial" ? "Teste termina" : "Período termina"}>{day(sub.status === "trial" ? sub.trial_ends_at : sub.period_end)}{sub.days_left !== null ? ` (${sub.days_left} d)` : ""}</Field>
                <Field label="Crédito">{Number(sub.credit_balance) > 0 ? kz(sub.credit_balance) : "—"}</Field>
                <Field label="Próximo plano">{sub.pending_plan?.name}</Field>
                <Field label="Cancela no fim do período">{sub.cancel_at_period_end ? "Sim" : "Não"}</Field>
                <Field label="Add-ons activos">{sub.addons.length ? sub.addons.map((a) => a.name).join(", ") : ""}</Field>
              </dl>
            </Panel>
          ) : <p className="text-sm text-muted-foreground">Esta escola ainda não tem subscrição.</p>}

          <Panel title="Ordens de subscrição" description="As 10 mais recentes" icon="ReceiptText" action={<Button asChild size="sm" variant="ghost"><Link href="/subscriptions?tab=ordens">Todas as ordens</Link></Button>}>
            {orders.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">Sem ordens.</p> : (
              <ul className="divide-y">
                {orders.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <div>
                      <p className="font-medium">{o.plan.name} · {ORDER_KIND[o.kind] ?? o.kind} · {o.period_months} {o.period_months === 1 ? "mês" : "meses"}</p>
                      <p className="text-xs text-muted-foreground">{dateTime(o.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-primary">{kz(o.total_amount)}</span>
                      <StatusBadge status={o.status} map={ORDER_STATUS} />
                      <Button size="sm" variant="outline" onClick={() => openModal(ORDER_REVIEW_MODAL, o.id)}>Abrir</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="direitos" className="pt-4"><SchoolEntitlementsTab schoolId={schoolId} /></TabsContent>
        <TabsContent value="utilizadores" className="pt-4"><UsersTable schoolId={schoolId} embedded /></TabsContent>
        <TabsContent value="actividade" className="pt-4"><SchoolActivityTab schoolId={schoolId} /></TabsContent>
      </Tabs>

      <OrderReviewModal />
      <ProofViewer id={PROOF_MODAL} loadProof={subscriptionService.proof} />
      <SubscriptionStateModal />
      <UserActionModal />
      <ImpersonateModal />
      {titulars.length === 0 && <Badge variant="pending" className="self-start">Esta escola não tem Titular activo</Badge>}
    </div>
  );
}
