"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
    Field,
    FieldLabel,
    FieldContent,
    FieldError,
    FieldGroup,
    Input,
    Textarea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    ButtonSubmit,
    Button
} from "@workspace/ui";
import { useCreateLeadAdmin, useAllServices, useAffiliates } from "@/hooks/affiliate";
import { LeadAdminCreate, AffiliateStatus } from "@workspace/types/affiliate";
import { toast } from "sonner";

const formSchema = z.object({
    client_nome: z.string().min(2, "Nome é obrigatório"),
    client_telefone: z.string().min(9, "Telefone inválido"),
    service_id: z.string().min(1, "Selecione um serviço"),
    affiliate_code: z.string().min(1, "Código do afiliado é obrigatório"),
    notas: z.string().optional(),
});

interface RegisterLeadFormProps {
    initialAffiliateCode?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function RegisterLeadForm({ initialAffiliateCode, onSuccess, onCancel }: RegisterLeadFormProps) {
    const { data: services } = useAllServices();
    const { data: affiliates } = useAffiliates({ status: AffiliateStatus.ACTIVE });
    const { mutate: createLead, isPending } = useCreateLeadAdmin();

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            client_nome: "",
            client_telefone: "",
            service_id: "",
            affiliate_code: initialAffiliateCode || "",
            notas: "",
        },
    });

    useEffect(() => {
        if (initialAffiliateCode) {
            setValue("affiliate_code", initialAffiliateCode);
        }
    }, [initialAffiliateCode, setValue]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        const payload: LeadAdminCreate = {
            ...values,
            service_id: parseInt(values.service_id),
        };

        createLead(payload, {
            onSuccess: () => {
                toast.success("Cliente/Lead atribuído com sucesso!");
                reset();
                onSuccess?.();
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.detail || "Erro ao registrar lead.");
            }
        });
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                    control={control}
                    name="client_nome"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Nome do Cliente *</FieldLabel>
                            <FieldContent>
                                <Input placeholder="Ex: João Lourenço" {...field} />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />
                <Controller
                    control={control}
                    name="client_telefone"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Telefone *</FieldLabel>
                            <FieldContent>
                                <Input placeholder="Ex: 923 000 000" {...field} />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />
            </FieldGroup>

            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                    control={control}
                    name="service_id"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Serviço Mindgest *</FieldLabel>
                            <FieldContent>
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um serviço" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {services?.map((service) => (
                                            <SelectItem key={service.id} value={service.id.toString()}>
                                                {service.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />
                <Controller
                    control={control}
                    name="affiliate_code"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Afiliado Responsável *</FieldLabel>
                            <FieldContent className="space-y-2">
                                {affiliates && affiliates.length > 0 && (
                                    <Select 
                                        onValueChange={(val) => field.onChange(val)} 
                                        value={affiliates.some(a => a.codigo_afiliado === field.value) ? field.value : undefined}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecionar das opções..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {affiliates.map((aff) => (
                                                <SelectItem key={aff.id} value={aff.codigo_afiliado}>
                                                    {aff.nome_completo} ({aff.codigo_afiliado})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                <Input placeholder="Código do Afiliado (ex: MWD-AO-1234)" {...field} />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />
            </FieldGroup>

            <Controller
                control={control}
                name="notas"
                render={({ field, fieldState }) => (
                    <Field>
                        <FieldLabel>Notas (Opcional)</FieldLabel>
                        <FieldContent>
                            <Textarea 
                                placeholder="Detalhes adicionais sobre a atribuição do cliente..." 
                                className="resize-none"
                                {...field} 
                            />
                            <FieldError errors={[fieldState.error]} />
                        </FieldContent>
                    </Field>
                )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onCancel}
                    className="w-full md:w-auto"
                >
                    Cancelar
                </Button>
                <ButtonSubmit isLoading={isPending} className="w-full md:w-auto">
                    Atribuir Cliente
                </ButtonSubmit>
            </div>
        </form>
    );
}

