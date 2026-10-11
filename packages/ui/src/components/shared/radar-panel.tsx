"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/chart";
import { Panel } from "./panel";
import type { icons } from "lucide-react";

interface RadarPanelProps {
  title: string;
  description?: string;
  icon?: keyof typeof icons;
  axes: { label: string; value: number }[];
  /** Nome da série no tooltip. */
  seriesLabel?: string;
  className?: string;
}

const config = { value: { label: "Total", color: "var(--chart-1)" } } satisfies ChartConfig;

/** Perfil de várias medidas comparáveis (contagens) num único gráfico; precisa de 3+ eixos para fazer sentido. */
export function RadarPanel({ title, description, icon, axes, seriesLabel, className }: RadarPanelProps) {
  return (
    <Panel title={title} description={description} icon={icon} className={className}>
      <ChartContainer config={seriesLabel ? { value: { ...config.value, label: seriesLabel } } : config} className="mx-auto aspect-square max-h-64 w-full max-w-xs sm:max-w-sm">
        <RadarChart data={axes} outerRadius="70%">
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <PolarAngleAxis dataKey="label" tick={{ fontSize: 11 }} />
          <PolarGrid />
          <Radar dataKey="value" fill="var(--color-value)" fillOpacity={0.25} stroke="var(--color-value)" strokeWidth={2} />
        </RadarChart>
      </ChartContainer>
    </Panel>
  );
}
