"use client";

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
    InputCurrency,
    Textarea,
    ButtonSubmit,
    Switch
} from "@workspace/ui";
import { useCreateService, useUpdateService } from "@/hooks/affiliate";
import { Service } from "@workspace/types/affiliate";
import { toast } from "sonner";

const formSchema = z.object({
    nome: z.string().min(2, "Nome é obrigatório"),
    descricao: z.string().optional(),
    preco: z.coerce.number().min(0, "Preço deve ser positivo"),
    comissao: z.coerce.number().min(0, "Comissão deve ser positiva").max(100, "Máximo 100%"),
    ativo: z.boolean(),
});

interface ServiceFormProps {
    service?: Service;
    onSuccess?: () => void;
}

export function ServiceForm({ service, onSuccess }: ServiceFormProps) {
    const isEditing = !!service;
    const { mutate: createService, isPending: isCreating } = useCreateService();
    const { mutate: updateService, isPending: isUpdating } = useUpdateService();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: service?.nome || "",
            descricao: service?.descricao || "",
            preco: service?.preco || 0,
            comissao: service?.comissao || 10,
            ativo: service?.ativo ?? true,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (isEditing) {
            updateService({ id: service.id, data: values }, {
                onSuccess: () => {
                    toast.success("Serviço atualizado com sucesso!");
                    onSuccess?.();
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.detail || "Erro ao atualizar serviço.");
                }
            });
        } else {
            createService(values, {
                onSuccess: () => {
                    toast.success("Serviço criado com sucesso!");
                    reset();
                    onSuccess?.();
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.detail || "Erro ao criar serviço.");
                }
            });
        }
    }

    return (
        <form onSubmit={handleSubmit((values) => onSubmit(values as z.infer<typeof formSchema>))} className="space-y-6">
            <Controller
                control={control}
                name="nome"
                render={({ field, fieldState }) => (
                    <Field>
                        <FieldLabel>Nome do Serviço</FieldLabel>
                        <FieldContent>
                            <Input placeholder="Ex: Consultoria Premium" {...field} />
                            <FieldError errors={[fieldState.error]} />
                        </FieldContent>
                    </Field>
                )}
            />

            <Controller
                control={control}
                name="descricao"
                render={({ field, fieldState }) => (
                    <Field>
                        <FieldLabel>Descrição</FieldLabel>
                        <FieldContent>
                            <Textarea 
                                placeholder="Detalhes do serviço..." 
                                className="resize-none"
                                {...field} 
                            />
                            <FieldError errors={[fieldState.error]} />
                        </FieldContent>
                    </Field>
                )}
            />

            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                    control={control}
                    name="preco"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Preço Sugerido</FieldLabel>
                            <FieldContent>
                                <InputCurrency 
                                    placeholder="0,00"
                                    value={field.value}
                                    onValueChange={field.onChange}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />
                <Controller
                    control={control}
                    name="comissao"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Comissão (%)</FieldLabel>
                            <FieldContent>
                                <Input type="number" step="0.1" {...field} />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />
            </FieldGroup>

            <Controller
                control={control}
                name="ativo"
                render={({ field }) => (
                    <Field orientation="horizontal" className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FieldLabel className="text-base">Status Ativo</FieldLabel>
                            <div className="text-sm text-muted-foreground">
                                Define se o serviço está disponível para seleção.
                            </div>
                        </div>
                        <FieldContent className="flex-none">
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FieldContent>
                    </Field>
                )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
                <ButtonSubmit isLoading={isCreating || isUpdating} className="w-full">
                    {isEditing ? "Salvar Alterações" : "Criar Serviço"}
                </ButtonSubmit>
            </div>
        </form>
    );
}
