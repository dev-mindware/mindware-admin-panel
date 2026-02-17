import { z } from "zod";
import { phoneNumberSchema, taxNumberSchema } from "./helps";

export const clientSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres"),
  taxNumber: taxNumberSchema,
  phone: phoneNumberSchema,
  email: z.string().trim().email("Email inválido"),
  address: z.string().trim().optional(),
  iban: z
    .string()
    .trim()
    .transform((val) => val.replace(/\s+/g, ""))
    .optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
