/** Máscaras de entrada: devolvem o texto já formatado enquanto o utilizador escreve. Os valores seguem o que a API aceita. */

/** NIF angolano: letras e dígitos, em maiúsculas, até 14 caracteres (o de empresa tem 10 dígitos, ex.: 5417000000). */
export const maskNif = (v: string) => v.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 14);

/** Telemóvel de Angola: «+244 923 456 789». Aceita colar com ou sem indicativo. */
export function maskPhone(v: string) {
  let d = v.replace(/\D/g, "");
  if (d.startsWith("244")) d = d.slice(3);
  d = d.slice(0, 9);
  if (!d) return "";
  const parts = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean);
  return `+244 ${parts.join(" ")}`;
}

/** Só dígitos (quantidades, meses, posições). */
export const digitsOnly = (v: string) => v.replace(/\D/g, "");
