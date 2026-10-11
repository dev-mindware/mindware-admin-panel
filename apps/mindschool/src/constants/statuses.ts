import type { StatusMap } from "@workspace/ui";

/** Estados com tom fixo em todo o painel: o mesmo estado tem sempre o mesmo rótulo e a mesma cor. */
export const ORDER_STATUS: StatusMap = {
  pending_payment: { label: "A aguardar pagamento", tone: "neutral" },
  payment_proof_submitted: { label: "Por rever", tone: "warning" },
  under_review: { label: "Em revisão", tone: "info" },
  approved: { label: "Aprovada", tone: "success" },
  rejected: { label: "Rejeitada", tone: "danger" },
  proof_replacement_required: { label: "Novo comprovativo pedido", tone: "warning" },
  cancelled: { label: "Cancelada", tone: "neutral" },
};

export const SUBSCRIPTION_STATUS: StatusMap = {
  trial: { label: "Em teste", tone: "info" },
  active: { label: "Activa", tone: "success" },
  past_due: { label: "Em atraso", tone: "warning" },
  grace: { label: "Tolerância", tone: "warning" },
  suspended: { label: "Suspensa", tone: "danger" },
  cancelled: { label: "Cancelada", tone: "neutral" },
  expired: { label: "Expirada", tone: "danger" },
};

export const COUPON_STATE: StatusMap = {
  active: { label: "Activo", tone: "success" },
  inactive: { label: "Inactivo", tone: "neutral" },
  expired: { label: "Expirado", tone: "danger" },
  scheduled: { label: "Agendado", tone: "info" },
  exhausted: { label: "Esgotado", tone: "warning" },
};

export const USER_STATUS: StatusMap = {
  activo: { label: "Activo", tone: "success" },
  suspenso: { label: "Suspenso", tone: "warning" },
  bloqueado: { label: "Bloqueado", tone: "danger" },
};

export const ORDER_KIND: Record<string, string> = { new: "Nova", upgrade: "Upgrade", downgrade: "Downgrade", renewal: "Renovação", addon: "Add-on" };

export const SEVERITY: StatusMap = {
  critical: { label: "Crítico", tone: "danger" },
  warning: { label: "Aviso", tone: "warning" },
  info: { label: "Informação", tone: "neutral" },
};
