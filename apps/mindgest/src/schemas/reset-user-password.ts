import { z } from "zod";

export const resetUserPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .trim()
      .min(8, "A palavra-passe deve ter, no mínimo, 8 caracteres"),
    passwordConfirmation: z
      .string()
      .trim()
      .min(1, "Confirme a nova palavra-passe"),
  })
  .refine((data) => data.newPassword === data.passwordConfirmation, {
    message: "As palavras-passe não coincidem",
    path: ["passwordConfirmation"],
  });

export type ResetUserPasswordFormData = z.infer<typeof resetUserPasswordSchema>;
