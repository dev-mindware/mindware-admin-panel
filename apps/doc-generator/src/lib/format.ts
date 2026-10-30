import { APP_TIMEZONE } from "@/constants/activities";

const dateTime = new Intl.DateTimeFormat("pt-PT", {
  timeZone: APP_TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const dateOnly = new Intl.DateTimeFormat("pt-PT", {
  timeZone: APP_TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export const formatDateTime = (iso?: string | null) =>
  iso ? dateTime.format(new Date(iso)) : "—";

export const formatDate = (iso?: string | null) =>
  iso ? dateOnly.format(new Date(iso)) : "—";

/** ISO (UTC) -> valor de <input type="datetime-local"> na hora de Luanda (UTC+1, sem DST). */
export function toLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const shifted = new Date(new Date(iso).getTime() + 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 16);
}

/** Valor de <input type="datetime-local"> (hora de Luanda) -> ISO UTC. */
export function fromLocalInput(value?: string): string | undefined {
  if (!value) return undefined;
  return new Date(new Date(`${value}:00.000Z`).getTime() - 60 * 60 * 1000).toISOString();
}
