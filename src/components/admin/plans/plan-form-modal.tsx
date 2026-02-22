"use client";

import { useForm, Controller, SubmitHandler, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
    GlobalModal,
    Icon,
    Button,
    Input,
    Checkbox,
    Switch,
    Field,
    FieldLabel,
    FieldContent,
    FieldError,
    FieldGroup,
} from "@/components";
import { Plan } from "@/types/plan";
import { useModal } from "@/stores/modal/use-modal-store";
import { useAdminPlans, useCreatePlan, useUpdatePlan } from "@/hooks/plans";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { PlanSchema, PlanFormData } from "@/schemas/plan";

export function PlanFormModal() {
    const { modalData, closeModal, open } = useModal();
    const data = modalData["manage-plan"] as { plan?: Plan };
    const plan = data?.plan;

    const createMutation = useCreatePlan();
    const updateMutation = useUpdatePlan();

    const isOpen = open["manage-plan"] || false;

    const { control, handleSubmit, reset } = useForm<PlanFormData>({
        resolver: zodResolver(PlanSchema),
        defaultValues: {
            name: "",
            priceMonthly: 0,
            isPublic: true,
            maxUsers: 1,
            maxStores: 1,
            trialPeriodInDays: null,
            billingIntervals: ["monthly"],
            features: {
                hasPos: false,
                canExportSaft: true,
                hasStock: false,
                hasInvoices: true,
                hasReporting: true,
                hasSuppliers: false,
                hasAppearance: false,
                hasPrintFormats: false,
            },
        },
    });

    useEffect(() => {
        if (plan && isOpen) {
            reset({
                name: plan.name,
                priceMonthly: Number(plan.priceMonthly),
                isPublic: plan.isPublic,
                maxUsers: plan.maxUsers,
                maxStores: plan.maxStores,
                trialPeriodInDays: plan.trialPeriodInDays ?? null,
                billingIntervals: ["monthly"],
                features: {
                    hasPos: plan.features.hasPos ?? false,
                    canExportSaft: plan.features.canExportSaft ?? true,
                    hasStock: plan.features.hasStock ?? false,
                    hasInvoices: plan.features.hasInvoices ?? true,
                    hasReporting: plan.features.hasReporting ?? true,
                    hasSuppliers: plan.features.hasSuppliers ?? false,
                    hasAppearance: plan.features.hasAppearance ?? false,
                    hasPrintFormats: plan.features.hasPrintFormats ?? false,
                },
            });
        } else if (!isOpen) {
            reset();
        }
    }, [plan, isOpen, reset]);

    if (!isOpen) return null;

    const handleClose = () => {
        closeModal("manage-plan");
    };

    const onSubmit: SubmitHandler<PlanFormData> = async (formData) => {
        try {
            if (plan) {
                await updateMutation.mutateAsync({ id: plan.id, data: formData });
                SucessMessage("Plano atualizado com sucesso!");
            } else {
                await createMutation.mutateAsync(formData);
                SucessMessage("Plano criado com sucesso!");
            }
            handleClose();
        } catch (error: any) {
            ErrorMessage(error?.response?.data?.message || "Erro ao guardar o plano");
        }
    };

    return (
        <GlobalModal
            id="manage-plan"
            title={
                <div className="flex items-center gap-2">
                    <Icon name={plan ? "Pencil" : "Plus"} className="w-5 h-5 text-primary" />
                    {plan ? `Editar Plano: ${plan.name}` : "Criar Novo Plano"}
                </div>
            }
            canClose
            className="max-w-3xl"
        >
            <div className="py-4">
                <form id="plan-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            control={control}
                            name="name"
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Nome do Plano</FieldLabel>
                                    <FieldContent>
                                        <Input placeholder="Ex: Pro, Enterprise..." {...field} />
                                        <FieldError errors={[fieldState.error]} />
                                    </FieldContent>
                                </Field>
                            )}
                        />

                        <Controller
                            control={control}
                            name="priceMonthly"
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Preço Mensal (AOA)</FieldLabel>
                                    <FieldContent>
                                        <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                        <FieldError errors={[fieldState.error]} />
                                    </FieldContent>
                                </Field>
                            )}
                        />

                        <Controller
                            control={control}
                            name="maxUsers"
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Máx. Utilizadores</FieldLabel>
                                    <FieldContent>
                                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                        <FieldError errors={[fieldState.error]} />
                                    </FieldContent>
                                </Field>
                            )}
                        />

                        <Controller
                            control={control}
                            name="maxStores"
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Máx. Lojas (-1 = Ilimitado)</FieldLabel>
                                    <FieldContent>
                                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                        <FieldError errors={[fieldState.error]} />
                                    </FieldContent>
                                </Field>
                            )}
                        />

                        <Controller
                            control={control}
                            name="trialPeriodInDays"
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Período de Trial (Dias)</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            type="number"
                                            placeholder="Deixe vazio se não houver trial"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                                        />
                                        <FieldError errors={[fieldState.error]} />
                                    </FieldContent>
                                </Field>
                            )}
                        />

                        <Controller
                            control={control}
                            name="isPublic"
                            render={({ field }) => (
                                <Field orientation="horizontal" className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-8">
                                    <div className="space-y-0.5">
                                        <FieldLabel>Público</FieldLabel>
                                        <p className="text-[10px] text-muted-foreground">
                                            Visível para novos clientes
                                        </p>
                                    </div>
                                    <FieldContent>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FieldContent>
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Funcionalidades</h3>
                        <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                            <Controller
                                control={control}
                                name="features.hasPos"
                                render={({ field }) => (
                                    <Field orientation="horizontal" className="gap-3">
                                        <FieldContent>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FieldContent>
                                        <FieldLabel className="leading-none pt-1">Ponto de Venda (POS)</FieldLabel>
                                    </Field>
                                )}
                            />
                            <Controller
                                control={control}
                                name="features.canExportSaft"
                                render={({ field }) => (
                                    <Field orientation="horizontal" className="gap-3">
                                        <FieldContent>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FieldContent>
                                        <FieldLabel className="leading-none pt-1">Exportar SAFT</FieldLabel>
                                    </Field>
                                )}
                            />
                            <Controller
                                control={control}
                                name="features.hasStock"
                                render={({ field }) => (
                                    <Field orientation="horizontal" className="gap-3">
                                        <FieldContent>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FieldContent>
                                        <FieldLabel className="leading-none pt-1">Gestão de Stock</FieldLabel>
                                    </Field>
                                )}
                            />
                            <Controller
                                control={control}
                                name="features.hasInvoices"
                                render={({ field }) => (
                                    <Field orientation="horizontal" className="gap-3">
                                        <FieldContent>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FieldContent>
                                        <FieldLabel className="leading-none pt-1">Faturação</FieldLabel>
                                    </Field>
                                )}
                            />
                            <Controller
                                control={control}
                                name="features.hasReporting"
                                render={({ field }) => (
                                    <Field orientation="horizontal" className="gap-3">
                                        <FieldContent>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FieldContent>
                                        <FieldLabel className="leading-none pt-1">Relatórios</FieldLabel>
                                    </Field>
                                )}
                            />
                            <Controller
                                control={control}
                                name="features.hasSuppliers"
                                render={({ field }) => (
                                    <Field orientation="horizontal" className="gap-3">
                                        <FieldContent>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FieldContent>
                                        <FieldLabel className="leading-none pt-1">Fornecedores</FieldLabel>
                                    </Field>
                                )}
                            />
                            <Controller
                                control={control}
                                name="features.hasAppearance"
                                render={({ field }) => (
                                    <Field orientation="horizontal" className="gap-3">
                                        <FieldContent>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FieldContent>
                                        <FieldLabel className="leading-none pt-1">Personalização</FieldLabel>
                                    </Field>
                                )}
                            />
                            <Controller
                                control={control}
                                name="features.hasPrintFormats"
                                render={({ field }) => (
                                    <Field orientation="horizontal" className="gap-3">
                                        <FieldContent>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FieldContent>
                                        <FieldLabel className="leading-none pt-1">Formatos de Impressão</FieldLabel>
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </div>
                </form>
            </div>
            <div className="flex justify-end gap-3 border-t pt-4">
                <Button variant="outline" onClick={handleClose}>Cancelar</Button>
                <Button
                    type="submit"
                    form="plan-form"
                    disabled={createMutation.isPending || updateMutation.isPending}
                >
                    {createMutation.isPending || updateMutation.isPending ? "A guardar..." : plan ? "Atualizar Plano" : "Criar Plano"}
                </Button>
            </div>
        </GlobalModal>
    );
}
