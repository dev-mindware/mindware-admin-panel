"use client";

import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import type { icons } from "lucide-react";
import { Icon } from "@workspace/ui";
import { cn } from "@/lib/utils";
import type { NotificationItem as NotificationData, NotificationType } from "@/types/notification";

/** Ícone e cor por tipo (mesmo desenho do sino do MindGest). */
const STYLES: Record<NotificationType | "DEFAULT", { icon: keyof typeof icons; colorClass: string; iconClass: string }> = {
  REMINDER: { icon: "Clock", colorClass: "bg-primary/15", iconClass: "text-primary" },
  OVERDUE: { icon: "CircleAlert", colorClass: "bg-destructive/15", iconClass: "text-destructive" },
  ASSIGNED: { icon: "UserPlus", colorClass: "bg-primary/15", iconClass: "text-primary" },
  COMMENTED: { icon: "MessageSquare", colorClass: "bg-primary/15", iconClass: "text-primary" },
  WEEKLY_REPORT: { icon: "ChartColumn", colorClass: "bg-primary/15", iconClass: "text-primary" },
  TEST: { icon: "Info", colorClass: "bg-primary/15", iconClass: "text-primary" },
  DEFAULT: { icon: "Bell", colorClass: "bg-primary/15", iconClass: "text-primary" },
};

export function timeAgo(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: pt });
  } catch {
    return "recentemente";
  }
}

interface NotificationItemProps {
  notification: NotificationData;
  /** Omitido dentro do menu do sino: o próprio item de menu trata do clique. */
  onClick?: () => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const unread = !notification.readAt;
  const style = STYLES[notification.type] ?? STYLES.DEFAULT;

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 p-4 text-left transition-colors duration-150 hover:bg-muted/40",
        onClick && "cursor-pointer",
        unread && "bg-primary/5 dark:bg-primary/10",
      )}
      onClick={onClick}
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", style.colorClass)}>
        <Icon name={style.icon} className={cn("h-5 w-5", style.iconClass)} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              "line-clamp-1 text-sm",
              unread ? "font-semibold text-foreground" : "font-medium text-muted-foreground",
            )}
          >
            {notification.title}
          </h4>
          {unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Por ler" />}
        </div>

        <p className={cn("mt-1 line-clamp-2 text-sm", unread ? "text-foreground" : "text-muted-foreground")}>
          {notification.body}
        </p>

        <p className="mt-2 text-xs text-muted-foreground">{timeAgo(notification.createdAt)}</p>
      </div>
    </div>
  );
}
