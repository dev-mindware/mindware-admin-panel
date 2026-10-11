import type { AxiosError } from "axios";

interface Problem {
  detail?: string;
  title?: string;
  errors?: Array<{ field?: string; message?: string }>;
}

/** Mensagem legível de um erro da API (RFC 9457: `detail` e `errors[]`), ou o texto de reserva. */
export function getApiErrorMessage(error: unknown, fallback = "A operação falhou."): string {
  const data = (error as AxiosError<Problem>)?.response?.data;
  if (data?.errors?.length) {
    const msgs = data.errors.map((e) => e.message).filter(Boolean);
    if (msgs.length) return msgs.join(" ");
  }
  if (data?.detail) return data.detail;
  if (error instanceof Error && error.message && !/^Request failed/.test(error.message)) return error.message;
  return fallback;
}

/** Código de aplicação do erro (ex.: `MFA_REQUIRED`, `STEP_UP_REQUIRED`). */
export function getApiErrorCode(error: unknown): string | undefined {
  return (error as AxiosError<{ code?: string }>)?.response?.data?.code;
}
