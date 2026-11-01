import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(2, "O nome ou razão social deve ter pelo menos 2 caracteres."),
  tradeName: z.string().optional(),
  nif: z.string().min(5, "O NIF deve conter pelo menos 5 caracteres fiscais válidos."),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  email: z.string().email("Endereço de correio eletrónico inválido.").optional().or(z.literal("")),
  phone: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

