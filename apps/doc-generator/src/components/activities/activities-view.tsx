"use client";

import { useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import {
  Button,
  EmptyState,
  FilterToolbar,
  Icon,
  ListSkeleton,
  MetricGrid,
  PageWrapper,
  RequestError,
  TitleList,
} from "@workspace/ui";
import { useActivities } from "@/hooks/use-activities";
import { isOverdue } from "@/lib/activity-utils";
import type { Activity } from "@/types/activity";
import { ActivityFormDrawer } from "./activity-form-drawer";
import { KanbanBoard } from "./kanban-board";

const DAY_MS = 24 * 60 * 60 * 1000;

export function ActivitiesView() {
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [scope, setScope] = useQueryState("scope", parseAsString.withDefault(""));
  const [editing, setEditing] = useState<Activity | null>(null);
  const [creating, setCreating] = useState(false);

  // O kanban mostra tarefas e marcos; os eventos vivem no calendário.
  const { data, isLoading, isError, refetch } = useActivities({
    limit: 100,
    search: search || undefined,
    mine: scope === "mine" || undefined,
    sortBy: "position",
    sortOrder: "asc",
  });
  const items = (data?.data ?? []).filter((a) => a.kind !== "EVENT");

  const open = items.filter((a) => a.status !== "DONE" && a.status !== "CANCELLED");
  const soon = Date.now() + DAY_MS;
  const overdue = items.filter((a) => isOverdue(a)).length;
  const dueSoon = open.filter(
    (a) => a.dueAt && !isOverdue(a) && new Date(a.dueAt).getTime() <= soon,
  ).length;

  const filtered = Boolean(search) || scope === "mine";

  return (
    <PageWrapper routeLabel="Actividades" subRoute="Quadro de Tarefas">
      <TitleList
        title="Actividades da Equipa"
        suTitle="Acompanhe tarefas e marcos por estado; arraste os cartões entre colunas para os actualizar"
      >
        <Button onClick={() => setCreating(true)}>
          <Icon name="CirclePlus" />
          Nova Actividade
        </Button>
      </TitleList>

      <MetricGrid
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        skeletons={4}
        items={[
          { title: open.length, subtitle: "Em aberto", description: `${items.length} no quadro`, icon: "ListTodo" },
          {
            title: items.filter((a) => a.status === "IN_PROGRESS" || a.status === "REVIEW").length,
            subtitle: "Em curso e revisão",
            icon: "Loader",
          },
          {
            title: overdue,
            subtitle: "Atrasadas",
            description: "Prazo passado e não concluídas",
            icon: "CalendarX",
            colors: overdue > 0 ? "destructive" : "default",
            variant: overdue > 0 ? "action" : "default",
          },
          { title: dueSoon, subtitle: "A vencer em 24 h", icon: "Clock" },
        ]}
      />

      <FilterToolbar
        search={{ value: search, onChange: (v) => void setSearch(v || null), placeholder: "Pesquisar por título ou descrição…" }}
        filters={[
          {
            key: "scope",
            label: "Responsável",
            value: scope,
            onChange: (v) => void setScope(v || null),
            options: [{ label: "As minhas", value: "mine" }],
            placeholder: "Toda a equipa",
          },
        ]}
        onClear={() => {
          void setSearch(null);
          void setScope(null);
        }}
      />

      {isError ? (
        <RequestError refetch={() => void refetch()} message="Não foi possível carregar as actividades." />
      ) : isLoading ? (
        <ListSkeleton cols={4} rows={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="SquareKanban"
          title={filtered ? "Nenhuma actividade encontrada" : "Ainda não há actividades"}
          description={
            filtered
              ? "Ajuste a pesquisa ou o filtro."
              : "Crie a primeira tarefa ou marco para acompanhar o trabalho da equipa."
          }
        />
      ) : (
        <>
          {data && data.total > data.data.length && (
            <p>
              A mostrar {data.data.length} de {data.total}. Use a pesquisa para refinar.
            </p>
          )}
          <KanbanBoard activities={items} onOpen={setEditing} />
        </>
      )}

      <ActivityFormDrawer
        open={creating || editing !== null}
        activity={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />
    </PageWrapper>
  );
}
