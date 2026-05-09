import { format as dateFnsFormat } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Formata uma data para o padrão PT-BR
 */
export function formatDate(date: string | Date | null | undefined, pattern = "dd/MM/yyyy"): string {
  if (!date) return "-";
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return "-";
  return dateFnsFormat(parsedDate, pattern, { locale: ptBR });
}

/**
 * Formata um número como moeda (Kwanza angolano por defeito)
 */
export function formatCurrency(
  value: number,
  currency = "AOA",
  locale = "pt-AO"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata um número com separadores de milhar
 */
export function formatNumber(value: number, locale = "pt-AO"): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Trunca um texto ao número de caracteres especificado
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Converte um string para slug URL-friendly
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
