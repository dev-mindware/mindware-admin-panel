"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/chart";
import { CHART_PALETTE } from "./chart-palette";
import { Panel } from "./panel";
import type { icons } from "lucide-react";

export interface BarItem {
  label: string;
  value: number;
}

interface BarListPanelProps {
  title: string;
  description?: string;
  icon?: keyof typeof icons;
  items: BarItem[];
  /** `horizontal` (por omissão): ranking com rótulos à esquerda, bom para nomes longos e telemóveis. `vertical`: colunas, para poucas categorias curtas. */
  orientation?: "horizontal" | "vertical";
  /** Pinta cada barra com uma cor própria em vez de uma só. */
  multicolor?: boolean;
  formatValue?: (v: number) => string;
  seriesLabel?: string;
  emptyText?: string;
  className?: string;
}

/** Barras de comparação entre categorias. Altura proporcional ao número de linhas; ocupa sempre a largura do cartão. */
export function BarListPanel({ title, description, icon, items, orientation = "horizontal", multicolor, formatValue, seriesLabel = "Total", emptyText = "Sem dados.", className }: BarListPanelProps) {
  const config = { value: { label: seriesLabel, color: "var(--chart-1)" } } satisfies ChartConfig;
  const fmt = formatValue ?? ((v: number) => String(v));
  const hasData = items.some((i) => i.value > 0);
  const horizontal = orientation === "horizontal";
  const height = horizontal ? Math.max(items.length * 40 + 8, 120) : 208;

  return (
    <Panel title={title} description={description} icon={icon} className={className}>
      {!hasData ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
          <BarChart data={items} layout={horizontal ? "vertical" : "horizontal"} margin={horizontal ? { left: 0, right: 40 } : { left: 0, right: 8, top: 16 }}>
            <CartesianGrid horizontal={!horizontal} vertical={horizontal} strokeDasharray="3 3" />
            {horizontal ? (
              <>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={104} tick={{ fontSize: 11 }} />
              </>
            ) : (
              <>
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} interval={0} />
                <YAxis hide />
              </>
            )}
            <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(v) => fmt(Number(v))} />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={horizontal ? 18 : 48}>
              {multicolor && items.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
              <LabelList dataKey="value" position={horizontal ? "right" : "top"} formatter={(v: number) => fmt(v)} className="fill-foreground text-[11px]" />
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </Panel>
  );
}
