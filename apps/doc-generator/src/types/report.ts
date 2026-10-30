export interface ReportWeek {
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
}

export interface ReportListItem {
  id: string;
  title: string;
  dueAt: string | null;
  completedAt?: string | null;
  onTime?: boolean | null;
  daysLate?: number;
  /** Só no relatório da equipa (actividades atrasadas). */
  assignees?: string[];
}

export interface MemberMetrics {
  completed: number;
  onTime: number;
  onTimeRate: number | null;
  avgCycleHours: number | null;
  inProgress: number;
  blocked: number;
  overdue: number;
  created: number;
  statusChanges: number;
  comments: number;
  documentsCreated: number;
  documentsApproved: number;
}

export type MemberListKey = "completed" | "overdue" | "blocked" | "inProgress" | "nextWeek";

export interface MemberSnapshot {
  window: { start: string; end: string };
  member: { id: string; name: string; email: string; role: string };
  metrics: MemberMetrics;
  lists: Record<MemberListKey, ReportListItem[]>;
  /** Total real quando a lista foi truncada. */
  totals: Record<MemberListKey, number>;
}

export interface TeamMemberRow extends MemberMetrics {
  id: string;
  name: string;
  role: string;
  idle: boolean;
}

export interface TeamSnapshot {
  window: { start: string; end: string };
  totals: {
    completed: number;
    onTime: number;
    onTimeRate: number | null;
    avgCycleHours: number | null;
    open: number;
    inProgress: number;
    blocked: number;
    overdue: number;
    unassignedOpen: number;
    created: number;
  };
  members: TeamMemberRow[];
  trend: { weekEnd: string; completed: number }[];
  overdueTop: ReportListItem[];
}

interface ReportRow<S> {
  id: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  snapshot: S;
}

export type MemberReport = ReportRow<MemberSnapshot> & { userId: string };
export type TeamReport = ReportRow<TeamSnapshot>;
