"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  GlobalModal,
  Icon,
  Button,
  Input,
  InputCurrency,
  Switch,
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components";
import { Coupon } from "@/types/coupon";
import { useModal } from "@/stores/modal/use-modal-store";
import { useCreateCoupon, useUpdateCoupon } from "@/hooks/coupons/use-coupons";
import { useAdminPlans } from "@/hooks/plans";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { CouponSchema, CouponFormData } from "@/schemas/coupon";

export function CouponFormModal() {
  const { modalData, closeModal, open } = useModal();
  const data = modalData["manage-coupon"] as { coupon?: Coupon };
  const coupon = data?.coupon;

  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const { plans } = useAdminPlans();

  const isOpen = open["manage-coupon"] || false;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CouponFormData>({
    resolver: zodResolver(CouponSchema),
    defaultValues: {
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 10,
      maxUsesPerCompany: 1,
      minSubscriptionMonths: null,
      applicablePlanId: null,
      startsAt: "",
      expiresAt: "",
      isActive: true,
    },
  });

  const discountType = watch("discountType");

  useEffect(() => {
    if (coupon) {
      reset({
        code: coupon.code,
        description: coupon.description || "",
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        maxUsesPerCompany: coupon.maxUsesPerCompany,
        minSubscriptionMonths: coupon.minSubscriptionMonths,
        applicablePlanId: coupon.applicablePlanId || null,
        startsAt: coupon.startsAt ? coupon.startsAt.split("T")[0] : "",
        expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "",
        isActive: coupon.isActive,
      });
    } else {
      reset({
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: 10,
        maxUsesPerCompany: 1,
        minSubscriptionMonths: null,
        applicablePlanId: null,
        startsAt: "",
        expiresAt: "",
        isActive: true,
      });
    }
  }, [coupon, reset, isOpen]);

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "MIND-";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue("code", result, { shouldValidate: true });
  };

  const onSubmit = async (formData: CouponFormData) => {
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description?.trim() || undefined,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxUsesPerCompany: formData.maxUsesPerCompany ? Number(formData.maxUsesPerCompany) : 1,
        minSubscriptionMonths: formData.minSubscriptionMonths ? Number(formData.minSubscriptionMonths) : undefined,
        applicablePlanId:
          formData.applicablePlanId && formData.applicablePlanId !== "ALL"
            ? formData.applicablePlanId
            : undefined,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
        isActive: formData.isActive,
      };

      if (coupon) {
        await updateMutation.mutateAsync({
          id: coupon.id,
          data: payload,
        });
        SucessMessage("Cupão atualizado com sucesso!");
      } else {
        await createMutation.mutateAsync(payload);
        SucessMessage("Cupão criado com sucesso!");
      }

      closeModal("manage-coupon");
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message || "Ocorreu um erro ao guardar o cupão."
      );
    }
  };

  return (
    <GlobalModal
      id="manage-coupon"
      title={
        <div className="flex items-center gap-2">
          <Icon name={coupon ? "Pencil" : "Ticket"} className="w-5 h-5 text-primary" />
          <span>{coupon ? "Editar Cupão" : "Novo Cupão de Desconto"}</span>
        </div>
      }
      description="Configure o código, tipo de desconto e regras de aplicação para campanhas promocionais."
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Código do Cupão */}
          <div className="md:col-span-2">
            <Field>
              <FieldLabel>Código do Cupão *</FieldLabel>
              <FieldContent>
                <div className="flex gap-2">
                  <Controller
                    name="code"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="EX: PROMO2026, DESCONTO15"
                        className="uppercase font-bold tracking-wider"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    )}
                  />
                  {!coupon && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateRandomCode}
                      title="Gerar código aleatório"
                    >
                      <Icon name="Sparkles" className="w-4 h-4 mr-1 text-primary" />
                      Gerar
                    </Button>
                  )}
                </div>
                {errors.code && <FieldError>{errors.code.message}</FieldError>}
              </FieldContent>
            </Field>
          </div>

          {/* Tipo de Desconto */}
          <Field>
            <FieldLabel>Tipo de Desconto *</FieldLabel>
            <FieldContent>
              <Controller
                name="discountType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentual (%)</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Valor Fixo (Kz)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.discountType && (
                <FieldError>{errors.discountType.message}</FieldError>
              )}
            </FieldContent>
          </Field>

          {/* Valor do Desconto */}
          <Field>
            <FieldLabel>
              Valor do Desconto * ({discountType === "PERCENTAGE" ? "%" : "Kz"})
            </FieldLabel>
            <FieldContent>
              <Controller
                name="discountValue"
                control={control}
                render={({ field }) =>
                  discountType === "FIXED_AMOUNT" ? (
                    <InputCurrency
                      value={field.value}
                      onValueChange={(val) => field.onChange(val || 0)}
                      placeholder="0.00"
                    />
                  ) : (
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      placeholder="15"
                    />
                  )
                }
              />
              {errors.discountValue && (
                <FieldError>{errors.discountValue.message}</FieldError>
              )}
            </FieldContent>
          </Field>

          {/* Plano Aplicável */}
          <Field>
            <FieldLabel>Plano Aplicável</FieldLabel>
            <FieldContent>
              <Controller
                name="applicablePlanId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "ALL"}
                    onValueChange={(val) => field.onChange(val === "ALL" ? null : val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todos os Planos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos os Planos</SelectItem>
                      {plans.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldContent>
          </Field>

          {/* Mínimo de Meses */}
          <Field>
            <FieldLabel>Mínimo de Meses de Subscrição</FieldLabel>
            <FieldContent>
              <Controller
                name="minSubscriptionMonths"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    min="1"
                    placeholder="Sem mínimo"
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value, 10) : null
                      )
                    }
                  />
                )}
              />
            </FieldContent>
          </Field>

          {/* Limite por Empresa */}
          <Field>
            <FieldLabel>Limite de Usos por Empresa</FieldLabel>
            <FieldContent>
              <Controller
                name="maxUsesPerCompany"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                  />
                )}
              />
            </FieldContent>
          </Field>

          {/* Data Início */}
          <Field>
            <FieldLabel>Data de Início (Opcional)</FieldLabel>
            <FieldContent>
              <Controller
                name="startsAt"
                control={control}
                render={({ field }) => (
                  <Input type="date" {...field} value={field.value || ""} />
                )}
              />
            </FieldContent>
          </Field>

          {/* Data Expiração */}
          <Field>
            <FieldLabel>Data de Expiração (Opcional)</FieldLabel>
            <FieldContent>
              <Controller
                name="expiresAt"
                control={control}
                render={({ field }) => (
                  <Input type="date" {...field} value={field.value || ""} />
                )}
              />
            </FieldContent>
          </Field>

          {/* Descrição */}
          <div className="md:col-span-2">
            <Field>
              <FieldLabel>Descrição / Notas Internas</FieldLabel>
              <FieldContent>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Ex: Campanha de Black Friday para novos clientes"
                    />
                  )}
                />
              </FieldContent>
            </Field>
          </div>

          {/* Ativo */}
          <div className="md:col-span-2 flex items-center justify-between p-3 rounded-lg border bg-muted/20">
            <div>
              <div className="text-sm font-semibold">Cupão Ativo</div>
              <div className="text-xs text-muted-foreground">
                Se desativado, utilizadores não conseguirão aplicar este código no checkout.
              </div>
            </div>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => closeModal("manage-coupon")}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isSubmitting || createMutation.isPending || updateMutation.isPending}
          >
            <Icon name="Save" className="w-4 h-4 mr-2" />
            {coupon ? "Guardar Alterações" : "Criar Cupão"}
          </Button>
        </div>
      </form>
    </GlobalModal>
  );
}
