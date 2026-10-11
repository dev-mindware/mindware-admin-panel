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
 * Regra do painel: uma página de lista tem pelo menos 4 indicadores úteis; abaixo disso, em desenvolvimento, avisa na consola.
 */
export function MetricGrid({ items, isLoading, isError, onRetry, skeletons, className }: MetricGridProps) {
  const n = isLoading ? (skeletons ?? Math.max(items.length, 4)) : items.length;
  const cols = n > 6 ? COLS[4] : COLS[Math.max(n, 1)];

  if (process.env.NODE_ENV !== "production" && !isLoading && !isError && items.length > 0 && items.length < 4) {
    console.warn(`[MetricGrid] ${items.length} indicador(es): o padrão do painel pede pelo menos 4.`);
  }

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
