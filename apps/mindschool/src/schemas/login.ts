import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Introduza o email.").email("Email inválido."),
  password: z.string().min(1, "Introduza a palavra-passe."),
  totpCode: z.string().trim().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
