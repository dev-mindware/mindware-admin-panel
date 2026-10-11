import { formatCurrency } from "@workspace/utils";

/** A API devolve dinheiro como texto decimal («29900.00»); o painel mostra sempre em Kz, com 2 casas. */
export const kz = (value: string | number | null | undefined): string => formatCurrency(Number(value ?? 0), "AOA", "pt-AO");

/** Kz sem casas decimais, para cartões e gráficos («1 234 500 Kz»). */
export const kzShort = (value: string | number | null | undefined): string =>
  new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", maximumFractionDigits: 0 }).format(Number(value ?? 0));

export const dateTime = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" }) : "—";

export const day = (iso: string | null | undefined): string => (iso ? new Date(iso).toLocaleDateString("pt-PT") : "—");

/** «há 3 h», «há 2 dias»: tempo desde `iso`. */
export function since(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return "—";
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `há ${hours} h`;
  return `há ${Math.round(hours / 24)} dias`;
}

export const monthLabel = (ym: string): string => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y!, (m ?? 1) - 1, 1)).toLocaleDateString("pt-PT", { month: "short", year: "2-digit", timeZone: "UTC" });
};

export const ROLE_LABEL: Record<string, string> = {
  titular: "Titular", direccao_pedagogica: "Direcção Pedagógica", secretaria: "Secretaria", professor: "Professor", financeiro: "Financeiro",
  encarregado: "Encarregado", aluno: "Aluno", admin_sistema: "Administrador de sistema", auditor_med: "Auditor do MED",
};
