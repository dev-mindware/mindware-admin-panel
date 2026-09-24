export interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  } | null;
}

export interface AuditLogListResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditLogSummary {
  totalEvents: number;
  byResource: { resource: string; _count: { id: number } }[];
  byAction: { action: string; _count: { id: number } }[];
  recentLogins: number;
}

export const ACTION_LABELS: Record<string, string> = {
  USER_CREATED: "Utilizador criado",
  USER_UPDATED: "Utilizador atualizado",
  USER_PASSWORD_RESET: "Senha redefinida",
  DOCUMENT_CREATED: "Documento criado",
  DOCUMENT_SUBMITTED: "Documento submetido",
  DOCUMENT_APPROVED: "Documento aprovado",
  DOCUMENT_REJECTED: "Documento rejeitado",
  ADMIN_DEPLOY_SYNC: "Sincronização de admin (deploy)",
  LOGIN: "Sessão iniciada",
};

export const RESOURCE_LABELS: Record<string, string> = {
  USER: "Utilizador",
  DOCUMENT: "Documento",
  SYSTEM: "Sistema",
  AUTH: "Autenticação",
};
