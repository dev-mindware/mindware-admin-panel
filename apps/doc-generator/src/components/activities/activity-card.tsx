"use client";

import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  Panel,
  ToneBadge,
} from "@workspace/ui";
import { KANBAN_COLUMNS, PRIORITY_LABEL, PRIORITY_TONE } from "@/constants/activities";
import { formatDateTime } from "@/lib/format";
import { isOverdue } from "@/lib/activity-utils";
import type { Activity, ActivityStatus } from "@/types/activity";

interface Props {
  activity: Activity;
  /**
   * Muda o estado sem arrastar. É a alternativa por toque e por teclado ao arrastar
   * (WCAG 2.5.7) e a forma normal de mover cartões no telemóvel.
   */
  onMove?: (status: ActivityStatus) => void;
  /** Pega para arrastar (só no computador). Um botão próprio evita ter botões dentro de um elemento arrastável. */
  dragHandle?: React.ReactNode;
}

/** Cartão do kanban: um `Panel` por actividade, sem estilos próprios. */
export function ActivityCard({ activity, onMove, dragHandle }: Props) {
  const when = activity.dueAt ?? activity.startAt;
  const late = isOverdue(activity);

  return (
    <Panel
      title={activity.title}
      description={
        when ? `${formatDateTime(when)}${late ? " · atrasada" : ""}` : "Sem data"
      }
      icon={late ? "CalendarX" : "CalendarClock"}
      action={
        <ToneBadge
          label={PRIORITY_LABEL[activity.priority]}
          tone={late ? "danger" : PRIORITY_TONE[activity.priority]}
        />
      }
    >
      <div className="flex items-center gap-1">
        {dragHandle}
        {activity.assignees.slice(0, 4).map((a) => (
          <Avatar key={a.userId} title={a.user.name}>
            <AvatarFallback>{a.user.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
        ))}
        {activity.assignees.length === 0 && <Icon name="UserX" />}
        {activity.source !== "APP" && (
          <span>via {activity.source === "TRELLO" ? "Trello" : "Google"}</span>
        )}
        {onMove && (
          // Fica fora do arrasto e do clique do cartão (que abre a actividade).
          <div onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" aria-label={`Mover «${activity.title}» para outro estado`}>
                  <Icon name="ArrowRightLeft" />
                  Mover
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>Mover para</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {KANBAN_COLUMNS.filter((c) => c.status !== activity.status).map((c) => (
                  <DropdownMenuItem key={c.status} onSelect={() => onMove(c.status)}>
                    {c.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </Panel>
  );
}
