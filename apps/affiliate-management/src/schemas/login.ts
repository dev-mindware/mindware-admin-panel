import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().trim().min(1, "Campo obrigatório"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
