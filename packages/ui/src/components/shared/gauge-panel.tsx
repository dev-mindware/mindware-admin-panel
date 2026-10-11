"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { ChartContainer, type ChartConfig } from "../ui/chart";
import { Panel } from "./panel";
import type { icons } from "lucide-react";

interface GaugePanelProps {
  title: string;
  description?: string;
  icon?: keyof typeof icons;
  /** 0–100; `null` mostra «—» (sem base de cálculo). */
  percent: number | null;
  /** Legenda por baixo do valor, ex.: «de 12 administradores». */
  caption?: string;
  /** Abaixo deste valor o indicador fica em alerta (vermelho). */
  warnBelow?: number;
  className?: string;
}

/** Taxa (cobertura, conversão, entrega) num medidor semicircular. Verde por omissão, vermelho quando abaixo do limiar. */
export function GaugePanel({ title, description, icon, percent, caption, warnBelow, className }: GaugePanelProps) {
  const value = percent === null ? 0 : Math.max(0, Math.min(100, percent));
  const color = warnBelow !== undefined && percent !== null && value < warnBelow ? "#ef4444" : "#22c55e";
  const config = { value: { label: title, color } } satisfies ChartConfig;

  return (
    <Panel title={title} description={description} icon={icon} className={className}>
      <div className="relative mx-auto w-full max-w-[260px]">
        <ChartContainer config={config} className="aspect-[2/1] w-full">
          <RadialBarChart data={[{ value }]} startAngle={180} endAngle={0} innerRadius="130%" outerRadius="190%" cy="100%">
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={8} fill="var(--color-value)" background={{ fill: "var(--muted)" }} />
          </RadialBarChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="text-2xl font-semibold tabular-nums">{percent === null ? "—" : `${Math.round(value)}%`}</span>
          {caption && <span className="text-[11px] text-muted-foreground">{caption}</span>}
        </div>
      </div>
    </Panel>
  );
}
