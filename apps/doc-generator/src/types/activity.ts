import type { PaginatedResult } from "./pagination";

export type ActivityKind = "EVENT" | "TASK" | "MILESTONE";
export type ActivityStatus =
  | "BACKLOG"
  | "TODO"
  | "IN_PROGRESS"
  | "REVIEW"
  | "DONE"
  | "BLOCKED"
  | "CANCELLED";
export type ActivityPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type ActivitySource = "APP" | "GOOGLE" | "TRELLO";

export interface UserBrief {
  id: string;
  name: string;
  email: string;
}

export interface ActivityAssignee {
  activityId: string;
  userId: string;
  role: "OWNER" | "COLLABORATOR";
  user: UserBrief;
}

export interface ActivityComment {
  id: string;
  body: string;
  createdAt: string;
  author: UserBrief;
}

export interface ActivityEventItem {
  id: string;
  type:
    | "CREATED"
    | "UPDATED"
    | "STATUS_CHANGED"
    | "REASSIGNED"
    | "RESCHEDULED"
    | "COMMENTED"
    | "DELETED";
  fromValue: string | null;
  toValue: string | null;
  createdAt: string;
  actor: UserBrief | null;
}

export interface Activity {
  id: string;
  title: string;
  description: string | null;
  kind: ActivityKind;
  status: ActivityStatus;
  priority: ActivityPriority;
  startAt: string | null;
  endAt: string | null;
  allDay: boolean;
  dueAt: string | null;
  rrule: string | null;
  location: string | null;
  position: number;
  source: ActivitySource;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: UserBrief;
  client: { id: string; name: string } | null;
  document: { id: string; code: string; title: string } | null;
  assignees: ActivityAssignee[];
}

export interface ActivityDetail extends Activity {
  comments: ActivityComment[];
}

export interface ActivityListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ActivityStatus[];
  kind?: ActivityKind;
  priority?: ActivityPriority;
  assigneeId?: string;
  from?: string;
  to?: string;
  overdue?: boolean;
  mine?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "startAt" | "dueAt" | "priority" | "position" | "title";
  sortOrder?: "asc" | "desc";
}

export interface ActivityPayload {
  title: string;
  description?: string;
  kind?: ActivityKind;
  status?: ActivityStatus;
  priority?: ActivityPriority;
  startAt?: string;
  endAt?: string;
  allDay?: boolean;
  dueAt?: string;
  rrule?: string;
  location?: string;
  clientId?: string;
  documentId?: string;
  assigneeIds?: string[];
}

export type UpdateActivityPayload = Partial<ActivityPayload> & { version: number };

export interface MoveActivityPayload {
  status: ActivityStatus;
  position?: number;
  version?: number;
}

export type ActivityList = PaginatedResult<Activity>;
