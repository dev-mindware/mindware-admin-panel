import { api } from "@/services/api";
import type {
  NotificationList,
  NotificationPreferences,
} from "@/types/notification";

export const notificationsService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    unread?: boolean;
  }): Promise<NotificationList> => {
    const { data } = await api.get("/notifications", { params });
    return data;
  },

  unreadCount: async (): Promise<number> => {
    const { data } = await api.get("/notifications/unread-count");
    return data.count;
  },

  markRead: async (id: string): Promise<void> => {
    await api.post(`/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await api.post("/notifications/read-all");
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    const { data } = await api.get("/notifications/preferences");
    return data;
  },

  updatePreferences: async (
    payload: Partial<Omit<NotificationPreferences, "emailAvailable">>,
  ): Promise<NotificationPreferences> => {
    const { data } = await api.put("/notifications/preferences", payload);
    return data;
  },
};
