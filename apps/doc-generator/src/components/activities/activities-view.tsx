"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { useActivities } from "@/hooks/use-activities";
import type { Activity } from "@/types/activity";
import { ActivityFormModal } from "./activity-form-modal";
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pr-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Actividades</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Arraste os cartões entre colunas para actualizar o estado.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" /> Nova actividade
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value || null)}
          placeholder="Pesquisar…"
          aria-label="Pesquisar actividades"
          className="h-9 w-64 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={mine}
            onChange={(e) => setMine(e.target.checked || null)}
          />
          Só as minhas
        </label>
      </div>

      {isError ? (
        <div role="alert" className="rounded-lg border border-red-500/30 p-4 text-sm">
          Não foi possível carregar as actividades.{" "}
          <button type="button" className="underline" onClick={() => refetch()}>
            Tentar de novo
          </button>
        </div>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">A carregar…</p>
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

      <ActivityFormModal
        open={creating || editing !== null}
        activity={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />
    </div>
  );
}
