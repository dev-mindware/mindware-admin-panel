import { POSITION_STEP } from "@/constants/activities";
import type { Activity, ActivityStatus } from "@/types/activity";

/** Actividades de uma coluna, ordenadas como o kanban as mostra. */
export function columnItems(items: Activity[], status: ActivityStatus): Activity[] {
  return items
    .filter((a) => a.status === status)
    .sort((a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt));
}

/**
 * Posição fraccionária para inserir no índice `index` de uma coluna (já sem o
 * cartão arrastado). Entre dois vizinhos usa o ponto médio.
 */
export function positionAt(column: Activity[], index: number): number {
  const prev = column[index - 1]?.position;
  const next = column[index]?.position;
  if (prev === undefined && next === undefined) return POSITION_STEP;
  if (prev === undefined) return next! / 2;
  if (next === undefined) return prev + POSITION_STEP;
  return (prev + next) / 2;
}

export function isOverdue(a: Activity, now = new Date()): boolean {
  return (
    Boolean(a.dueAt) &&
    new Date(a.dueAt as string) < now &&
    a.status !== "DONE" &&
    a.status !== "CANCELLED"
  );
}
