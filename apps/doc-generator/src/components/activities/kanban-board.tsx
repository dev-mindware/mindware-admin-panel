"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KANBAN_COLUMNS } from "@/constants/activities";
import { columnItems, positionAt } from "@/lib/activity-utils";
import { useMoveActivity } from "@/hooks/use-activities";
import type { Activity, ActivityStatus } from "@/types/activity";
import { ActivityCard } from "./activity-card";

const COLUMN_PREFIX = "column:";

function SortableCard({ activity, onOpen }: { activity: Activity; onOpen: (a: Activity) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-40" : undefined}
      {...attributes}
      {...listeners}
    >
      <ActivityCard activity={activity} onOpen={onOpen} />
    </div>
  );
}

function Column({
  status,
  label,
  items,
  onOpen,
}: {
  status: ActivityStatus;
  label: string;
  items: Activity[];
  onOpen: (a: Activity) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${COLUMN_PREFIX}${status}` });
  return (
    <section
      ref={setNodeRef}
      aria-label={label}
      className={`flex w-72 shrink-0 flex-col rounded-xl border bg-muted/30 ${
        isOver ? "ring-2 ring-primary/40" : ""
      }`}
    >
      <header className="flex items-center justify-between px-3 py-2">
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="rounded-full bg-muted px-2 text-xs text-muted-foreground">
          {items.length}
        </span>
      </header>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-24 flex-1 flex-col gap-2 p-2">
          {items.map((a) => (
            <SortableCard key={a.id} activity={a} onOpen={onOpen} />
          ))}
          {items.length === 0 && (
            <p className="py-6 text-center text-xs text-muted-foreground">Sem actividades</p>
          )}
        </div>
      </SortableContext>
    </section>
  );
}

interface Props {
  activities: Activity[];
  onOpen: (activity: Activity) => void;
}

export function KanbanBoard({ activities, onOpen }: Props) {
  const move = useMoveActivity();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const columns = useMemo(
    () => KANBAN_COLUMNS.map((c) => ({ ...c, items: columnItems(activities, c.status) })),
    [activities],
  );
  const active = activities.find((a) => a.id === activeId) ?? null;

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active: dragged, over } = e;
    if (!over) return;

    const activity = activities.find((a) => a.id === dragged.id);
    if (!activity) return;

    const overId = String(over.id);
    const target = overId.startsWith(COLUMN_PREFIX)
      ? (overId.slice(COLUMN_PREFIX.length) as ActivityStatus)
      : activities.find((a) => a.id === overId)?.status;
    if (!target) return;

    // Coluna de destino sem o cartão arrastado.
    const column = columnItems(activities, target).filter((a) => a.id !== activity.id);
    const overIndex = overId.startsWith(COLUMN_PREFIX)
      ? column.length
      : column.findIndex((a) => a.id === overId);
    if (overIndex < 0) return;

    // Na mesma coluna, arrastar para baixo insere depois do cartão sobre o qual caiu.
    const originalIndex = columnItems(activities, target).findIndex((a) => a.id === activity.id);
    const index =
      target === activity.status && originalIndex !== -1 && originalIndex <= overIndex
        ? overIndex + 1
        : overIndex;

    if (target === activity.status && originalIndex === index) return;

    move.mutate({
      id: activity.id,
      status: target,
      position: positionAt(column, Math.min(index, column.length)),
      version: activity.version,
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {columns.map((c) => (
          <Column key={c.status} status={c.status} label={c.label} items={c.items} onOpen={onOpen} />
        ))}
      </div>
      <DragOverlay>{active ? <ActivityCard activity={active} /> : null}</DragOverlay>
    </DndContext>
  );
}
