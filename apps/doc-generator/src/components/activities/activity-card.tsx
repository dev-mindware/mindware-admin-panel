"use client";

import { Badge, Icon } from "@workspace/ui";
import { PRIORITY_BADGE, PRIORITY_LABEL } from "@/constants/activities";
import { formatDateTime } from "@/lib/format";
import { isOverdue } from "@/lib/activity-utils";
import type { Activity } from "@/types/activity";

interface Props {
  activity: Activity;
  onOpen?: (activity: Activity) => void;
}

export function ActivityCard({ activity, onOpen }: Props) {
  const overdue = isOverdue(activity);
  const when = activity.dueAt ?? activity.startAt;

  return (
    <button
      type="button"
      onClick={() => onOpen?.(activity)}
      className="w-full rounded-lg border bg-card p-3 text-left shadow-xs transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{activity.title}</p>
        <Badge variant={PRIORITY_BADGE[activity.priority]} className="shrink-0 text-[10px]">
          {PRIORITY_LABEL[activity.priority]}
        </Badge>
      </div>

      {when && (
        <p
          className={`mt-2 flex items-center gap-1 text-xs ${
            overdue ? "font-medium text-red-600 dark:text-red-400" : "text-muted-foreground"
          }`}
        >
          <Icon name="CalendarClock" size={12} />
          {formatDateTime(when)}
          {overdue && " · atrasada"}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {activity.assignees.slice(0, 3).map((a) => (
            <span
              key={a.userId}
              title={a.user.name}
              className="flex size-5 items-center justify-center rounded-full border border-background bg-muted text-[9px] font-semibold uppercase"
            >
              {a.user.name.slice(0, 1)}
            </span>
          ))}
          {activity.assignees.length > 3 && (
            <span className="flex size-5 items-center justify-center rounded-full border border-background bg-muted text-[9px]">
              +{activity.assignees.length - 3}
            </span>
          )}
        </div>
        {activity.source !== "APP" && (
          <span className="text-[10px] text-muted-foreground">
            via {activity.source === "TRELLO" ? "Trello" : "Google"}
          </span>
        )}
      </div>
    </button>
  );
}
