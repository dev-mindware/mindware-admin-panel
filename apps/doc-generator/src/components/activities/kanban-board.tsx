"use client";

import { useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
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
import { Button, Icon, Panel, ScrollArea, ScrollBar } from "@workspace/ui";
import { KANBAN_COLUMNS } from "@/constants/activities";
import { columnItems, positionAt } from "@/lib/activity-utils";
import { useMoveActivity } from "@/hooks/use-activities";
import type { Activity, ActivityStatus } from "@/types/activity";
import { ActivityCard } from "./activity-card";

const COLUMN_PREFIX = "column:";

function SortableCard({
  activity,
  onOpen,
  onMove,
}: {
  activity: Activity;
  onOpen: () => void;
  onMove: (status: ActivityStatus) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : undefined,
      }}
      onClick={onOpen}
    >
      <ActivityCard
        activity={activity}
        onMove={onMove}
        dragHandle={
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              ref={setActivatorNodeRef}
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Arrastar «${activity.title}»`}
              // Sem isto o toque faria scroll em vez de arrastar.
              style={{ touchAction: "none" }}
              {...attributes}
              {...listeners}
            >
              <Icon name="GripVertical" />
            </Button>
          </div>
        }
      />
    </div>
  );
}

function Column({
  status,
  label,
  items,
  onOpen,
  onMove,
}: {
  status: ActivityStatus;
  label: string;
  items: Activity[];
  onOpen: (a: Activity) => void;
  onMove: (a: Activity, status: ActivityStatus) => void;
}) {
  const { setNodeRef } = useDroppable({ id: `${COLUMN_PREFIX}${status}` });
  return (
    <div ref={setNodeRef} className="w-72 shrink-0" role="region" aria-label={label}>
      <Panel
        title={label}
        description={`${items.length} ${items.length === 1 ? "actividade" : "actividades"}`}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex min-h-16 flex-col gap-3">
            {items.map((a) => (
              <SortableCard key={a.id} activity={a} onOpen={() => onOpen(a)} onMove={(st) => onMove(a, st)} />
            ))}
          </div>
        </SortableContext>
      </Panel>
    </div>
  );
}

interface Props {
  activities: Activity[];
  onOpen: (activity: Activity) => void;
}

export function KanbanBoard({ activities, onOpen }: Props) {
  const move = useMoveActivity();
  const [activeId, setActiveId] = useState<string | null>(null);
  // O clique que se segue a largar um cartão não deve abrir a actividade.
  const dragged = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const columns = useMemo(
    () => KANBAN_COLUMNS.map((c) => ({ ...c, items: columnItems(activities, c.status) })),
    [activities],
  );
  const active = activities.find((a) => a.id === activeId) ?? null;

  /** Mover para o fim de outra coluna (menu "Mover", sem arrastar). */
  function moveTo(activity: Activity, status: ActivityStatus) {
    const column = columnItems(activities, status);
    move.mutate({
      id: activity.id,
      status,
      position: positionAt(column, column.length),
      version: activity.version,
    });
  }

  function onDragStart(e: DragStartEvent) {
    dragged.current = true;
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    setTimeout(() => (dragged.current = false), 0);
    const { active: item, over } = e;
    if (!over) return;

    const activity = activities.find((a) => a.id === item.id);
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
      onDragCancel={() => {
        setActiveId(null);
        dragged.current = false;
      }}
    >
      <ScrollArea>
        <div className="flex gap-4 pb-4">
          {columns.map((c) => (
            <Column
              key={c.status}
              status={c.status}
              label={c.label}
              items={c.items}
              onOpen={(a) => !dragged.current && onOpen(a)}
              onMove={moveTo}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <DragOverlay>{active ? <ActivityCard activity={active} /> : null}</DragOverlay>
    </DndContext>
  );
}
