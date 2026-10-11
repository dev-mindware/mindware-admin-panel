import type { DonutSlice, StatusMap } from "@workspace/ui";

/** Converte uma contagem por estado (`{ active: 3, trial: 1 }`) nas fatias de um donut, com os rótulos do painel. */
export function slicesFromCounts(counts: Record<string, number>, labels: StatusMap | Record<string, string>): DonutSlice[] {
  return Object.entries(counts).map(([key, value]) => {
    const l = labels[key];
    return { key, value, label: typeof l === "string" ? l : (l?.label ?? key) };
  });
}
