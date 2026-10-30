"use client";

import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from "@workspace/ui";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from "@/hooks/use-notifications";
import { formatDateTime } from "@/lib/format";
import type { NotificationItem } from "@/types/notification";

export function NotificationBell() {
  const router = useRouter();
  const unread = useUnreadCount();
  const count = unread.data ?? 0;
  const list = useNotifications(true);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  function openItem(n: NotificationItem) {
    if (!n.readAt) markRead.mutate(n.id);
    // Só navega para caminhos internos.
    const target = n.link?.startsWith("/") ? n.link : n.activityId ? "/activities" : null;
    if (target) router.push(target);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Notificações">
          <Icon name="Bell" />
          {count > 0 && <Badge variant="destructive">{count > 99 ? "99+" : count}</Badge>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {list.isLoading && <DropdownMenuItem disabled>A carregar...</DropdownMenuItem>}
        {list.isError && <DropdownMenuItem disabled>Não foi possível carregar.</DropdownMenuItem>}
        {list.data?.data.length === 0 && <DropdownMenuItem disabled>Sem notificações</DropdownMenuItem>}
        {list.data?.data.map((n) => (
          <DropdownMenuItem key={n.id} onSelect={() => openItem(n)}>
            <div>
              <p>
                {!n.readAt && "● "}
                {n.title}
              </p>
              <p>{n.body}</p>
              <p>{formatDateTime(n.createdAt)}</p>
            </div>
          </DropdownMenuItem>
        ))}
        {count > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={markAll.isPending} onSelect={() => markAll.mutate()}>
              Marcar todas como lidas
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
