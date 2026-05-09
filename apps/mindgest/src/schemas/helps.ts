import { z } from "zod";

export const FileSchema = z.object({
  fieldname: z.string().trim().optional(),
  originalname: z.string().trim(),
  encoding: z.string().trim().optional(),
  mimetype: z.string().trim(),
  buffer: z.any().optional(),
  size: z.number(),
  url: z.string().trim().url().optional(),
});

export const ItemSchema = z.object({
  id: z.string().trim().optional(),
  description: z.string().trim().optional(),
  type: z.enum(["PRODUCT", "SERVICE"]),
  quantity: z
    .number({ invalid_type_error: "A quantidade deve ser um número" })
    .positive("A quantidade deve ser maior que 0"),
  unitPrice: z
    .number({ invalid_type_error: "O preço unitário deve ser um número" })
    .positive("O preço unitário deve ser maior que 0"),
  discount: z

    .number({ invalid_type_error: "O desconto deve ser numérico" })
    .min(0, "O desconto não pode ser negativo")
    .optional()
    .nullable(),
  total: z
    .number({ invalid_type_error: "O total deve ser um número" })
    .positive("O total deve ser maior que 0")
    .optional()
    .nullable(),

  isFromAPI: z.boolean().optional(),
  taxId: z.string().trim().optional(),
});

export const taxNumberSchema = z
  .string()
  .trim()
  .nonempty("Campo obrigatorio")
  .refine(
    (value) => /^\d{9}[A-Z]{2}\d{3}$/.test(value) || /^\d{10}$/.test(value),
    "NIF inválido — use formato de pessoa singular ou coletiva",
  );

export const phoneNumberSchema = z
  .string()
  .trim()
  .max(9, "O número deve ter 9 dígitos")
  .refine(
    (value: string) => /^(92|99|91|95|93|94|97)\d{7}$/.test(value ?? ""),
    "Insira número de telemovél válido",
  );

export const passwordSchema = z
  .string()
  .trim()
  .nonempty("Campo obrigatório")
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula (A-Z)")
  .regex(/[a-z]/, "Deve conter pelo menos uma letra minúscula (a-z)")
  .regex(/[0-9]/, "Deve conter pelo menos um número (0-9)")
  .regex(/[^a-zA-Z0-9]/, "Deve conter pelo menos um caractere especial");
