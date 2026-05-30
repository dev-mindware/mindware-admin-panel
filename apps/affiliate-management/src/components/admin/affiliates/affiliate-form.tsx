"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ButtonSubmit,
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
} from "@workspace/ui";
import { Affiliate, AffiliateStatus } from "@workspace/types/affiliate";
import { useCreateAffiliate, useUpdateAffiliate } from "@/hooks/affiliate";
import { toast } from "sonner";

const affiliateSchema = z.object({
  nome_completo: z.string().min(2, "O nome é obrigatório."),
  email: z.string().email("Informe um email válido."),
  telefone: z.string().optional(),
  conta_bancaria: z.string().optional(),
  banco: z.string().optional(),
  status: z.nativeEnum(AffiliateStatus),
  password: z.string().optional(),
});

type AffiliateFormData = z.infer<typeof affiliateSchema>;

type Props = {
  affiliate?: Affiliate;
  onSuccess?: () => void;
};

export function AffiliateForm({ affiliate, onSuccess }: Props) {
  const isEditing = !!affiliate;
  const { mutate: createAffiliate, isPending: isCreating } = useCreateAffiliate();
  const { mutate: updateAffiliate, isPending: isUpdating } = useUpdateAffiliate();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AffiliateFormData>({
    resolver: zodResolver(affiliateSchema),
    defaultValues: {
      nome_completo: affiliate?.nome_completo || "",
      email: affiliate?.email || "",
      telefone: affiliate?.telefone || "",
      conta_bancaria: affiliate?.conta_bancaria || "",
      banco: affiliate?.banco || "",
      status: affiliate?.status || AffiliateStatus.ACTIVE,
      password: "",
    },
  });

  useEffect(() => {
    reset({
      nome_completo: affiliate?.nome_completo || "",
      email: affiliate?.email || "",
      telefone: affiliate?.telefone || "",
      conta_bancaria: affiliate?.conta_bancaria || "",
      banco: affiliate?.banco || "",
      status: affiliate?.status || AffiliateStatus.ACTIVE,
      password: "",
    });
  }, [affiliate, reset]);

  function onSubmit(values: AffiliateFormData) {
    const payload = {
      ...values,
      telefone: values.telefone || undefined,
      conta_bancaria: values.conta_bancaria || undefined,
      banco: values.banco || undefined,
      password: values.password || undefined,
    };

    if (isEditing) {
      const { password: _password, ...updatePayload } = payload;
      updateAffiliate(
        { id: affiliate.id, data: updatePayload },
        {
          onSuccess: () => {
            toast.success("Afiliado atualizado com sucesso.");
            onSuccess?.();
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.message || "Não foi possível atualizar o afiliado.");
          },
        },
      );
      return;
    }

    createAffiliate(payload, {
      onSuccess: () => {
        toast.success("Afiliado criado com sucesso.");
        reset();
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Não foi possível criar o afiliado.");
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Controller
        control={control}
        name="nome_completo"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Nome completo</FieldLabel>
            <FieldContent>
              <Input placeholder="Ex: João Cardoso" {...field} />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Email</FieldLabel>
              <FieldContent>
                <Input type="email" placeholder="email@empresa.ao" {...field} />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
        <Controller
          control={control}
          name="telefone"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Telefone</FieldLabel>
              <FieldContent>
                <Input placeholder="+244 923 000 000" {...field} />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name="banco"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Banco</FieldLabel>
              <FieldContent>
                <Input placeholder="Ex: BAI" {...field} />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
        <Controller
          control={control}
          name="conta_bancaria"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Conta/IBAN</FieldLabel>
              <FieldContent>
                <Input placeholder="AO060006..." {...field} />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name="status"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Estado</FieldLabel>
              <FieldContent>
                <select
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  {...field}
                >
                  <option value={AffiliateStatus.PENDING_APPROVAL}>Pendente</option>
                  <option value={AffiliateStatus.ACTIVE}>Ativo</option>
                  <option value={AffiliateStatus.INACTIVE}>Inativo</option>
                  <option value={AffiliateStatus.SUSPENDED}>Suspenso</option>
                  <option value={AffiliateStatus.REJECTED}>Rejeitado</option>
                </select>
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
        {!isEditing && (
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Senha inicial</FieldLabel>
                <FieldContent>
                  <Input type="password" placeholder="Opcional" {...field} />
                  <FieldError errors={[fieldState.error]} />
                </FieldContent>
              </Field>
            )}
          />
        )}
      </FieldGroup>

      <div className="flex justify-end gap-3 border-t pt-4">
        <ButtonSubmit isLoading={isCreating || isUpdating} className="w-full">
          {isEditing ? "Guardar alterações" : "Criar afiliado"}
        </ButtonSubmit>
      </div>
    </form>
  );
}
