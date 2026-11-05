"use client";

import { useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui";
import { formatDateTime } from "@/lib/format";
import type { NotificationItem } from "@/types/notification";

/** Destino interno da notificação (só caminhos relativos ao painel; nunca URLs externos). */
export function notificationTarget(n: NotificationItem): string | null {
  if (n.link?.startsWith("/")) return n.link;
  return n.activityId ? "/activities" : null;
}

interface NotificationDetailProps {
  notification: NotificationItem | null;
  onClose: () => void;
}

export function NotificationDetail({ notification, onClose }: NotificationDetailProps) {
  const router = useRouter();
  const target = notification ? notificationTarget(notification) : null;

  return (
    <Dialog open={notification !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>{notification?.title ?? "Detalhes da notificação"}</DialogTitle>
          <DialogDescription>
            {notification ? `Recebida em ${formatDateTime(notification.createdAt)}` : ""}
          </DialogDescription>
        </DialogHeader>

        <p className="whitespace-pre-line leading-relaxed text-foreground">{notification?.body}</p>

        <DialogFooter>
          {target && (
            <Button
              onClick={() => {
                onClose();
                router.push(target);
              }}
            >
              Abrir
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
