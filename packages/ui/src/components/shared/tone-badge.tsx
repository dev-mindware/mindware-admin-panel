import { Badge } from "../ui/badge";
import { cn } from "@workspace/utils";

export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const VARIANT = {
  success: "success",
  warning: "pending",
  danger: "destructive",
  info: "default",
  neutral: "secondary",
} as const;

/** Estado com tom fixo (verde, âmbar, vermelho, azul, neutro): o mesmo estado tem sempre a mesma cor em todo o painel. */
export function ToneBadge({ label, tone = "neutral", className }: { label: string; tone?: Tone; className?: string }) {
  return (
    <Badge variant={VARIANT[tone]} className={cn("font-medium", className)}>
      {label}
    </Badge>
  );
}

/** Tabela de estados de uma entidade: `{ activo: { label: "Activo", tone: "success" } }`. */
export type StatusMap = Record<string, { label: string; tone: Tone }>;

export function StatusBadge({ status, map, className }: { status: string; map: StatusMap; className?: string }) {
  const s = map[status];
  return <ToneBadge label={s?.label ?? status.replace(/_/g, " ")} tone={s?.tone ?? "neutral"} className={className} />;
}
