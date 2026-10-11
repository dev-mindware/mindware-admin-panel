"use client";

import { Cell, Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/chart";
import { CHART_PALETTE as PALETTE } from "./chart-palette";
import { Panel } from "./panel";
import type { icons } from "lucide-react";

export interface DonutSlice {
  key: string;
  label: string;
  value: number;
}

interface DonutPanelProps {
  title: string;
  description?: string;
  icon?: keyof typeof icons;
  slices: DonutSlice[];
  /** Texto no centro do donut (por omissão, a soma). */
  centerLabel?: string;
  emptyText?: string;
  className?: string;
}


/** Distribuição por categoria: donut com legenda numérica. Usa as cores `--chart-*` do tema e ignora categorias a zero. */
export function DonutPanel({ title, description, icon, slices, centerLabel, emptyText = "Sem dados.", className }: DonutPanelProps) {
  const data = slices.filter((s) => s.value > 0).map((s, i) => ({ ...s, fill: PALETTE[i % PALETTE.length] }));
  const total = data.reduce((a, s) => a + s.value, 0);
  const config = Object.fromEntries(data.map((s) => [s.key, { label: s.label, color: s.fill }])) satisfies ChartConfig;

  return (
    <Panel title={title} description={description} icon={icon} className={className}>
      {total === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <div className="relative h-40 w-40 shrink-0">
            <ChartContainer config={config} className="h-40 w-40">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
                <Pie data={data} dataKey="value" nameKey="key" innerRadius={48} outerRadius={72} paddingAngle={2} strokeWidth={0}>
                  {data.map((s) => <Cell key={s.key} fill={s.fill} />)}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-semibold tabular-nums">{total}</span>
              {centerLabel && <span className="text-[10px] text-muted-foreground">{centerLabel}</span>}
            </div>
          </div>
          <ul className="w-full space-y-1.5 text-sm">
            {data.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground"><span className="size-2.5 rounded-sm" style={{ background: s.fill }} />{s.label}</span>
                <span className="font-semibold tabular-nums">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}
