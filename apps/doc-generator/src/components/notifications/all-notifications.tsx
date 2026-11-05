"use client";

import { useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import {
  Button,
  Icon,
  ListSkeleton,
  PageWrapper,
  RequestError,
  Tabs,
  TabsList,
  TabsTrigger,
  TitleList,
} from "@workspace/ui";
import {
  useInfiniteNotifications,
  useMarkAllRead,
  useMarkRead,
  useUnreadCount,
} from "@/hooks/use-notifications";
import type { NotificationItem } from "@/types/notification";
import { NotificationDetail } from "./notification-detail";
import { NotificationList } from "./notification-list";

/** Página «Ver todas» do sino: a mesma lista, com scroll infinito e filtro de não lidas. */
export function AllNotifications() {
  const [filter, setFilter] = useQueryState("filter", parseAsString.withDefault("all"));
  const [selected, setSelected] = useState<NotificationItem | null>(null);

  const unreadOnly = filter === "unread";
  const list = useInfiniteNotifications({ unread: unreadOnly });
  const unread = useUnreadCount();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const count = unread.data ?? 0;

  function openNotification(notification: NotificationItem) {
    setSelected(notification);
    if (!notification.readAt) markRead.mutate(notification.id);
  }

  return (
    <PageWrapper routeLabel="Notificações" subRoute="Todas as notificações">
      <TitleList
        title="Notificações"
        suTitle="Lembretes, atribuições, comentários e relatórios. Os lembretes seguem as suas preferências de antecedência."
      >
        <Button variant="outline" disabled={count === 0 || markAll.isPending} onClick={() => markAll.mutate()}>
          <Icon name="CheckCheck" />
          Marcar todas como lidas
        </Button>
      </TitleList>

      <Tabs value={unreadOnly ? "unread" : "all"} onValueChange={(v) => void setFilter(v === "all" ? null : v)}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="unread">Por ler{count > 0 ? ` (${count})` : ""}</TabsTrigger>
        </TabsList>
      </Tabs>

      {list.isLoading ? (
        <ListSkeleton cols={1} rows={5} />
      ) : list.isError ? (
        <RequestError refetch={() => void list.refetch()} message="Não foi possível carregar as notificações." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <NotificationList
            className="h-[60vh]"
            notifications={list.notifications}
            hasNextPage={list.hasNextPage}
            fetchNextPage={() => void list.fetchNextPage()}
            isFetchingNextPage={list.isFetchingNextPage}
            onNotificationClick={openNotification}
          />
        </div>
      )}

      <NotificationDetail notification={selected} onClose={() => setSelected(null)} />
    </PageWrapper>
  );
}
