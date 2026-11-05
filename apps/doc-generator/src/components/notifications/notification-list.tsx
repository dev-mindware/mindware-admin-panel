"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCheck } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { DropdownMenuItem, EmptyState, ScrollArea } from "@workspace/ui";
import { cn } from "@/lib/utils";
import type { NotificationItem as NotificationData } from "@/types/notification";
import { NotificationItem } from "./notification-item";

interface NotificationListProps {
  notifications: NotificationData[];
  onNotificationClick: (notification: NotificationData) => void;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  className?: string;
  /** Dentro do menu do sino: mostra o cabeçalho e usa itens de menu (teclado e leitores de ecrã). */
  isDropdown?: boolean;
  unreadCount?: number;
  onMarkAllAsRead?: () => void;
  isMarkingAllAsRead?: boolean;
}

export function NotificationList({
  notifications,
  onNotificationClick,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  className,
  isDropdown = false,
  unreadCount = 0,
  onMarkAllAsRead,
  isMarkingAllAsRead,
}: NotificationListProps) {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && fetchNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="w-full">
      {isDropdown && (
        <div className="flex items-center justify-between border-b border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Notificações</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {unreadCount} {unreadCount > 1 ? "novas" : "nova"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && onMarkAllAsRead && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAllAsRead();
                }}
                disabled={isMarkingAllAsRead}
                className="flex cursor-pointer items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                title="Marcar todas como lidas"
              >
                <CheckCheck className="h-3.5 w-3.5 text-primary" />
                Marcar lidas
              </button>
            )}
            <Link href="/notifications" className="text-xs font-medium text-primary hover:underline">
              Ver todas
            </Link>
          </div>
        </div>
      )}

      <ScrollArea className={cn(notifications.length === 0 ? "h-max" : (className ?? "h-72"))}>
        {notifications.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="BellOff"
              title="Sem notificações"
              className="border-none"
              description="Não existem novas notificações neste momento."
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) =>
              isDropdown ? (
                <DropdownMenuItem
                  key={notification.id}
                  className="rounded-none p-0 focus:bg-transparent"
                  onSelect={() => onNotificationClick(notification)}
                >
                  <NotificationItem notification={notification} />
                </DropdownMenuItem>
              ) : (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => onNotificationClick(notification)}
                />
              ),
            )}

            {(hasNextPage || isFetchingNextPage) && (
              <div ref={ref} className="flex items-center justify-center p-4">
                {isFetchingNextPage ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <span className="text-xs text-muted-foreground">A carregar mais...</span>
                )}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
