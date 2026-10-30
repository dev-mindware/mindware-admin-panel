"use client";

import { useState } from "react";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import {
  Button,
  Card,
  EmptyState,
  Icon,
  Input,
  PageWrapper,
  TitleList,
} from "@workspace/ui";
import { useActivities } from "@/hooks/use-activities";
import type { Activity } from "@/types/activity";
import { ActivityFormDrawer } from "./activity-form-drawer";
import { KanbanBoard } from "./kanban-board";

export function ActivitiesView() {
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [mine, setMine] = useQueryState("mine", parseAsBoolean.withDefault(false));
  const [editing, setEditing] = useState<Activity | null>(null);
  const [creating, setCreating] = useState(false);

  // O kanban mostra tarefas e marcos; os eventos vivem no calendário.
  const { data, isLoading, isError, refetch } = useActivities({
    limit: 100,
    search: search || undefined,
    mine: mine || undefined,
    sortBy: "position",
    sortOrder: "asc",
  });
  const items = (data?.data ?? []).filter((a) => a.kind !== "EVENT");

  return (
    <PageWrapper routeLabel="Actividades" subRoute="Quadro de Tarefas">
      <TitleList
        title="Actividades da Equipa"
        suTitle="Acompanhe tarefas e marcos por estado; arraste os cartões entre colunas para os actualizar"
      >
        <Button onClick={() => setCreating(true)} className="gap-2 cursor-pointer">
          <Icon name="CirclePlus" size={16} />
          <span>Nova Actividade</span>
        </Button>
      </TitleList>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Input
            type="text"
            startIcon="Search"
            placeholder="Pesquisar por título ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value || null)}
          />
        </div>

        <div className="flex items-center bg-sidebar rounded-lg p-1 border border-border/80">
          {[
            { id: false, label: "Todas" },
            { id: true, label: "As minhas" },
          ].map((tab) => (
            <button
              key={String(tab.id)}
              type="button"
              onClick={() => setMine(tab.id || null)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                mine === tab.id
                  ? "bg-primary-50 dark:bg-primary/10 text-primary-700 dark:text-primary-400 font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <Card role="alert" className="p-12 text-center flex flex-col items-center justify-center gap-3">
          <span className="text-sm">Não foi possível carregar as actividades.</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar de novo
          </Button>
        </Card>
      ) : isLoading ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
          <span className="text-xs text-muted-foreground">A carregar actividades...</span>
        </Card>
      ) : items.length === 0 && !search && !mine ? (
        <EmptyState
          icon="SquareKanban"
          title="Ainda não há actividades"
          description="Crie a primeira tarefa ou marco para começar a acompanhar o trabalho da equipa."
        />
      ) : (
        <>
          {data && data.total > data.data.length && (
            <p className="text-xs text-muted-foreground">
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
