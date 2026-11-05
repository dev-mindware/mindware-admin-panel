import type { PaginatedResult } from "./pagination";

export type NotificationType =
  | "REMINDER"
  | "OVERDUE"
  | "ASSIGNED"
  | "COMMENTED"
  | "WEEKLY_REPORT"
  | "TEST";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  activityId: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPreferences {
  inApp: boolean;
  email: boolean;
  reminderOffsets: number[];
  emailAvailable: boolean;
}

export type NotificationList = PaginatedResult<NotificationItem>;
