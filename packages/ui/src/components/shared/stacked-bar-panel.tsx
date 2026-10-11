"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/chart";
import { CHART_PALETTE } from "./chart-palette";
import { Panel } from "./panel";
import type { icons } from "lucide-react";

interface StackedBarPanelProps {
  title: string;
  description?: string;
  icon?: keyof typeof icons;
  segments: { key: string; label: string; value: number }[];
  emptyText?: string;
  className?: string;
}

/** Composição de um total numa única barra segmentada, com legenda que passa a uma coluna em ecrãs estreitos. */
export function StackedBarPanel({ title, description, icon, segments, emptyText = "Sem dados.", className }: StackedBarPanelProps) {
  const data = segments.filter((s) => s.value > 0).map((s, i) => ({ ...s, fill: CHART_PALETTE[i % CHART_PALETTE.length] }));
  const total = data.reduce((a, s) => a + s.value, 0);
  const config = Object.fromEntries(data.map((s) => [s.key, { label: s.label, color: s.fill }])) satisfies ChartConfig;
  const row = Object.fromEntries([["name", title], ...data.map((s) => [s.key, s.value])]);

  return (
    <Panel title={title} description={description} icon={icon} className={className}>
      {total === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="space-y-4">
          <ChartContainer config={config} className="aspect-auto h-14 w-full">
            <BarChart data={[row]} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
              <XAxis type="number" hide domain={[0, total]} />
              <YAxis type="category" dataKey="name" hide />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              {data.map((s, i) => (
                <Bar key={s.key} dataKey={s.key} stackId="a" fill={s.fill} radius={i === 0 ? [6, 0, 0, 6] : i === data.length - 1 ? [0, 6, 6, 0] : 0} />
              ))}
            </BarChart>
          </ChartContainer>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {data.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 text-muted-foreground"><span className="size-2.5 shrink-0 rounded-sm" style={{ background: s.fill }} /><span className="truncate">{s.label}</span></span>
                <span className="font-semibold tabular-nums">{s.value} <span className="text-xs font-normal text-muted-foreground">({Math.round((s.value / total) * 100)}%)</span></span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}
