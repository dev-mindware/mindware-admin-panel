"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@workspace/ui";
import {
  useInfiniteNotifications,
  useMarkAllRead,
  useMarkRead,
  useUnreadCount,
} from "@/hooks/use-notifications";
import type { NotificationItem } from "@/types/notification";
import { NotificationDetail } from "./notification-detail";
import { NotificationList } from "./notification-list";

/** Sino com menu de notificações in-app (mesmo desenho do sino do MindGest). */
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<NotificationItem | null>(null);

  const unread = useUnreadCount();
  const count = unread.data ?? 0;
  const list = useInfiniteNotifications({ enabled: isOpen });
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  function openNotification(notification: NotificationItem) {
    setSelected(notification);
    if (!notification.readAt) markRead.mutate(notification.id);
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="relative"
            aria-label={count > 0 ? `Notificações, ${count} por ler` : "Notificações"}
          >
            <Bell className="h-5 w-5 text-foreground" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-[calc(100vw-1.5rem)] max-w-96 border-border p-0 shadow-lg"
          sideOffset={8}
        >
          <NotificationList
            isDropdown
            notifications={list.notifications}
            unreadCount={count}
            hasNextPage={list.hasNextPage}
            fetchNextPage={() => void list.fetchNextPage()}
            isFetchingNextPage={list.isFetchingNextPage}
            onNotificationClick={openNotification}
            onMarkAllAsRead={() => markAll.mutate()}
            isMarkingAllAsRead={markAll.isPending}
          />
          {list.isError && (
            <p className="border-t border-border p-3 text-center text-xs text-destructive">
              Não foi possível carregar as notificações.
            </p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationDetail notification={selected} onClose={() => setSelected(null)} />
    </>
  );
}
