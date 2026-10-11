"use client";

import { icons } from "lucide-react";
import { DynamicMetricCard } from "./dynamic-metric-card";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@workspace/utils";

export interface MetricItem {
  title: string | number;
  subtitle: string;
  description?: string;
  icon?: keyof typeof icons;
  variant?: "default" | "action" | "interactive";
  colors?: "default" | "destructive";
  onClick?: () => void;
}

interface MetricGridProps {
  items: MetricItem[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  /** Número de cartões nos estados de carregamento (por omissão, os que `items` teria). */
  skeletons?: number;
  className?: string;
}

const MAX_METRICS = 4;

const COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6",
};

/**
 * Faixa de indicadores de uma página: grelha única para todo o painel, com estados de carregamento e de erro («tentar de novo»).
 * Regra do painel: no máximo 4 indicadores por página (o resto vai para gráficos: donut, radar, barras). Acima disso, em desenvolvimento,
 * avisa na consola e só os 4 primeiros são mostrados.
 */
export function MetricGrid({ items: allItems, isLoading, isError, onRetry, skeletons, className }: MetricGridProps) {
  if (process.env.NODE_ENV !== "production" && allItems.length > MAX_METRICS) {
    console.warn(`[MetricGrid] ${allItems.length} indicadores: o máximo do painel é ${MAX_METRICS}. Mova o resto para gráficos.`);
  }
  const items = allItems.slice(0, MAX_METRICS);
  const n = isLoading ? Math.min(skeletons ?? 4, MAX_METRICS) : items.length;
  const cols = COLS[Math.max(n, 1)];

  if (isError) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-2 rounded-xl border bg-card py-8 text-center", className)}>
        <p className="text-sm text-muted-foreground">Não foi possível carregar os indicadores.</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-2.5 sm:gap-4", cols, className)}>
      {isLoading
        ? Array.from({ length: n }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl sm:h-32" />)
        : items.map((m) => <DynamicMetricCard key={m.subtitle} {...m} />)}
    </div>
  );
}
