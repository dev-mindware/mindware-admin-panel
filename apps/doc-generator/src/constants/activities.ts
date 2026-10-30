import type {
  ActivityKind,
  ActivityPriority,
  ActivityStatus,
} from "@/types/activity";

export const KANBAN_COLUMNS: { status: ActivityStatus; label: string }[] = [
  { status: "BACKLOG", label: "Backlog" },
  { status: "TODO", label: "A fazer" },
  { status: "IN_PROGRESS", label: "Em curso" },
  { status: "REVIEW", label: "Em revisão" },
  { status: "DONE", label: "Concluído" },
  { status: "BLOCKED", label: "Bloqueado" },
  { status: "CANCELLED", label: "Cancelado" },
];

export const STATUS_LABEL = Object.fromEntries(
  KANBAN_COLUMNS.map((c) => [c.status, c.label]),
) as Record<ActivityStatus, string>;

export const KIND_LABEL: Record<ActivityKind, string> = {
  EVENT: "Evento",
  TASK: "Tarefa",
  MILESTONE: "Marco",
};

export const PRIORITY_LABEL: Record<ActivityPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};

/** Variante do `Badge` de @workspace/ui por prioridade. */
export const PRIORITY_BADGE: Record<
  ActivityPriority,
  "outline" | "secondary" | "pending" | "destructive"
> = {
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "pending",
  URGENT: "destructive",
};

export const CLOSED_STATUSES: ActivityStatus[] = ["DONE", "CANCELLED"];

/** Passo da indexação fraccionária; igual ao da API. */
export const POSITION_STEP = 1000;

/** Fuso de apresentação: tudo é guardado em UTC. */
export const APP_TIMEZONE = "Africa/Luanda";
