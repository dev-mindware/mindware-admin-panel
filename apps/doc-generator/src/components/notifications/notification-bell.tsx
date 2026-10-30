"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = useUnreadCount();
  const list = useNotifications(open);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const count = unread.data ?? 0;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openItem(n: NotificationItem) {
    if (!n.readAt) markRead.mutate(n.id);
    setOpen(false);
    // Só navega para caminhos internos.
    const target = n.link?.startsWith("/") ? n.link : n.activityId ? "/activities" : null;
    if (target) router.push(target);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={count ? `Notificações (${count} por ler)` : "Notificações"}
        aria-expanded={open}
        className="relative flex size-9 items-center justify-center rounded-md hover:bg-muted"
      >
        <Bell className="size-5" />
        {count > 0 && (
          <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-4 text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notificações"
          className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border bg-card shadow-xl"
        >
          <div className="flex items-center justify-between border-b px-3 py-2">
            <h2 className="text-sm font-semibold">Notificações</h2>
            <button
              type="button"
              disabled={count === 0 || markAll.isPending}
              onClick={() => markAll.mutate()}
              className="text-xs text-primary hover:underline disabled:opacity-40"
            >
              Marcar todas como lidas
            </button>
          </div>
          <ul className="max-h-96 divide-y overflow-y-auto">
            {list.isLoading && <li className="p-4 text-sm text-muted-foreground">A carregar…</li>}
            {list.isError && <li className="p-4 text-sm">Não foi possível carregar.</li>}
            {list.data?.data.length === 0 && (
              <li className="p-6 text-center text-sm text-muted-foreground">Sem notificações</li>
            )}
            {list.data?.data.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => openItem(n)}
                  className={`block w-full px-3 py-2.5 text-left hover:bg-muted ${
                    n.readAt ? "" : "bg-primary/5"
                  }`}
                >
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {!n.readAt && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                    {n.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatDateTime(n.createdAt)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
