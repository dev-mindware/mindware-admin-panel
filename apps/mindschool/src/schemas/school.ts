import { z } from "zod";

/** Espelha as regras da API (`createSchoolSchema` + `onboardSchoolSchema`) para o erro aparecer no campo, antes do pedido. */
export const onboardSchema = z.object({
  name: z.string().trim().min(2, "Indique o nome da escola.").max(150, "No máximo 150 caracteres."),
  nif: z.string().trim().regex(/^[0-9A-Za-z]{9,14}$/, "O NIF tem entre 9 e 14 caracteres (letras e dígitos)."),
  subsystem: z.enum(["geral", "tecnico_profissional", "formacao_professores"]),
  med: z.string().trim().max(30, "No máximo 30 caracteres.").optional(),
  phone: z.string().trim().regex(/^(\+?[0-9 ()-]{7,20})?$/, "Telefone inválido.").optional(),
  email: z.string().trim().max(150).email("Email inválido.").or(z.literal("")).optional(),
  address: z.string().trim().max(255, "No máximo 255 caracteres.").optional(),
  trial: z.string(),
  titularName: z.string().trim().min(2, "Indique o nome completo do Titular.").max(200),
  titularEmail: z.string().trim().min(1, "Indique o email do Titular.").email("Email inválido.").max(150),
});

export type OnboardFormData = z.infer<typeof onboardSchema>;
