/**
 * Reautenticação (step-up) para operações críticas: quando a API responde `STEP_UP_REQUIRED`, o cliente HTTP pede a identidade ao
 * utilizador numa janela (`StepUpDialog`), troca palavra-passe (e 2.º factor) por um token de curta duração e repete o pedido com
 * `X-Step-Up-Token`. O token fica só em memória, até expirar. Este módulo não conhece o cliente HTTP (evita dependência circular).
 */

const REQUEST_EVENT = "stepup:request";
const SAFETY_MARGIN_MS = 5_000;

interface Cached {
  value: string;
  expiresAt: number;
}

export interface StepUpRequest {
  resolve: (token: string) => void;
  reject: (reason: Error) => void;
}

let cached: Cached | null = null;
let pending: Promise<string> | null = null;

export const STEP_UP_REQUEST_EVENT = REQUEST_EVENT;

/** Token ainda válido (com margem de segurança), ou `null`. */
export function getStepUpToken(now: number = Date.now()): string | null {
  return cached && cached.expiresAt - SAFETY_MARGIN_MS > now ? cached.value : null;
}

export function completeStepUp(token: string, expiresInSeconds: number, now: number = Date.now()): void {
  cached = { value: token, expiresAt: now + expiresInSeconds * 1000 };
}

export function clearStepUp(): void {
  cached = null;
}

/** Pede ao utilizador que se reautentique (uma única janela, mesmo com vários pedidos em simultâneo). */
export function requestStepUp(): Promise<string> {
  const valid = getStepUpToken();
  if (valid) return Promise.resolve(valid);
  if (pending) return pending;
  if (typeof window === "undefined") return Promise.reject(new Error("Reautenticação indisponível."));
  pending = new Promise<string>((resolve, reject) => {
    window.dispatchEvent(new CustomEvent<StepUpRequest>(REQUEST_EVENT, { detail: { resolve, reject } }));
  }).finally(() => {
    pending = null;
  });
  return pending;
}

export function isStepUpRequired(data: unknown): boolean {
  return typeof data === "object" && data !== null && (data as { code?: unknown }).code === "STEP_UP_REQUIRED";
}
