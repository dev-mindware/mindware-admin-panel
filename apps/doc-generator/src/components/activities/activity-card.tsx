"use client";

import { Avatar, AvatarFallback, Icon, Panel, ToneBadge } from "@workspace/ui";
import { PRIORITY_LABEL, PRIORITY_TONE } from "@/constants/activities";
import { formatDateTime } from "@/lib/format";
import { isOverdue } from "@/lib/activity-utils";
import type { Activity } from "@/types/activity";

interface Props {
  activity: Activity;
}

/** Cartão do kanban: um `Panel` por actividade, sem estilos próprios. */
export function ActivityCard({ activity }: Props) {
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
        {activity.assignees.slice(0, 4).map((a) => (
          <Avatar key={a.userId} title={a.user.name}>
            <AvatarFallback>{a.user.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
        ))}
        {activity.assignees.length === 0 && <Icon name="UserX" />}
        {activity.source !== "APP" && (
          <span>via {activity.source === "TRELLO" ? "Trello" : "Google"}</span>
        )}
      </div>
    </Panel>
  );
}
