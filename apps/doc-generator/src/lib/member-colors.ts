import { CHART_PALETTE } from "@workspace/ui";
import type { Activity } from "@/types/activity";

export interface MemberRef {
  id: string;
  name: string;
}

/** Membros que aparecem nas actividades carregadas (GET /users é só para ADMIN), por ordem alfabética. */
export function membersOf(activities: Activity[]): MemberRef[] {
  const map = new Map<string, MemberRef>();
  for (const a of activities)
    for (const x of a.assignees) map.set(x.userId, { id: x.userId, name: x.user.name });
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "pt"));
}

/**
 * Uma cor por membro, na ordem da lista (alfabética) e com a paleta dos gráficos do
 * painel: assim o `BarListPanel multicolor` e o calendário mostram a mesma cor por pessoa.
 */
export function memberColorMap(members: MemberRef[]): Map<string, string> {
  return new Map(members.map((m, i) => [m.id, CHART_PALETTE[i % CHART_PALETTE.length]]));
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;
