import type { Activity } from "@/types/activity";

const PALETTE = [
  "#2563eb",
  "#059669",
  "#9333ea",
  "#d97706",
  "#db2777",
  "#0891b2",
  "#65a30d",
  "#e11d48",
];

/**
 * Uma cor distinta por membro: atribuída pela posição na lista ordenada por id
 * (e não por hash, que pode dar a mesma cor a duas pessoas). Com mais de 8
 * membros as cores repetem-se.
 */
export function memberColorMap(members: { id: string }[]): Map<string, string> {
  const ids = members.map((m) => m.id).sort();
  return new Map(ids.map((id, i) => [id, PALETTE[i % PALETTE.length]]));
}

export interface MemberRef {
  id: string;
  name: string;
}

/** Membros que aparecem nas actividades carregadas (GET /users é só para ADMIN). */
export function membersOf(activities: Activity[]): MemberRef[] {
  const map = new Map<string, MemberRef>();
  for (const a of activities)
    for (const x of a.assignees) map.set(x.userId, { id: x.userId, name: x.user.name });
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "pt"));
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;
