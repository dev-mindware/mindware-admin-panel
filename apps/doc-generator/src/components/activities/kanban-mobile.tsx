"use client";

import { useMemo, useState } from "react";
import { EmptyState, ScrollArea, ScrollBar, Tabs, TabsList, TabsTrigger } from "@workspace/ui";
import { KANBAN_COLUMNS } from "@/constants/activities";
import { columnItems, positionAt } from "@/lib/activity-utils";
import { useMoveActivity } from "@/hooks/use-activities";
import type { Activity, ActivityStatus } from "@/types/activity";
import { ActivityCard } from "./activity-card";

interface Props {
  activities: Activity[];
  onOpen: (activity: Activity) => void;
}

/**
 * Kanban para telemóvel: um estado de cada vez, escolhido em separadores com
 * contagem, e o menu «Mover» em cada cartão. Arrastar entre colunas num ecrã
 * estreito (e ainda a fazer scroll) é frágil; o menu é directo e acessível.
 */
export function KanbanMobile({ activities, onOpen }: Props) {
  const move = useMoveActivity();
  const counts = useMemo(
    () => Object.fromEntries(KANBAN_COLUMNS.map((c) => [c.status, columnItems(activities, c.status).length])),
    [activities],
  );
  // Abre no primeiro estado com actividades.
  const firstFilled = KANBAN_COLUMNS.find((c) => counts[c.status] > 0)?.status ?? "TODO";
  const [selected, setSelected] = useState<ActivityStatus | null>(null);
  const status = selected ?? firstFilled;
  const items = columnItems(activities, status);

  function moveTo(activity: Activity, target: ActivityStatus) {
    const column = columnItems(activities, target);
    move.mutate({
      id: activity.id,
      status: target,
      position: positionAt(column, column.length),
      version: activity.version,
    });
  }

  return (
    <Tabs value={status} onValueChange={(v) => setSelected(v as ActivityStatus)}>
      <ScrollArea>
        <TabsList>
          {KANBAN_COLUMNS.map((c) => (
            <TabsTrigger key={c.status} value={c.status}>
              {c.label} ({counts[c.status]})
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="mt-4 flex flex-col gap-3" role="list" aria-label="Actividades">
        {items.length === 0 && (
          <EmptyState icon="SquareKanban" title="Sem actividades" description="Nada neste estado." />
        )}
        {items.map((a) => (
          <div key={a.id} role="listitem" onClick={() => onOpen(a)}>
            <ActivityCard activity={a} onMove={(st) => moveTo(a, st)} />
          </div>
        ))}
      </div>
    </Tabs>
  );
}
