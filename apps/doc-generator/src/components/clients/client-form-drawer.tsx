"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Button,
  ButtonSubmit,
  Input,
  Textarea,
} from "@workspace/ui";
import { clientSchema, ClientFormValues } from "@/schemas/client-schema";
import { useCreateClient } from "@/hooks/clients";

interface ClientFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientFormDrawer({ open, onOpenChange }: ClientFormDrawerProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      tradeName: "",
      nif: "",
      address: "",
      city: "",
      country: "Angola",
      email: "",
      phone: "",
    },
  });

  const createClientMutation = useCreateClient(() => {
    onOpenChange(false);
    reset();
  });

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = (data: ClientFormValues) => {
    createClientMutation.mutate({
      name: data.name,
      tradeName: data.tradeName || undefined,
      nif: data.nif,
      address: data.address || undefined,
      city: data.city || undefined,
      country: data.country || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl flex flex-col p-0 gap-0"
      >
        <SheetHeader className="p-6 border-b shrink-0 text-left">
          <SheetTitle>Novo Cliente / Entidade</SheetTitle>
          <SheetDescription>
            Introduza os dados cadastrais da empresa ou cliente final para faturação e propostas.
          </SheetDescription>
        </SheetHeader>

        <form
          id="client-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          <div>
            <Input
              label="Razão Social / Nome Oficial *"
              placeholder="Ex: Sonangol E.P. ou João Silva"
              error={errors.name?.message}
              {...register("name")}
            />
          </div>

          <div>
            <Input
              label="Nome Comercial (Opcional)"
              placeholder="Ex: Sonangol Distribuidora"
              error={errors.tradeName?.message}
              {...register("tradeName")}
            />
          </div>

          <div>
            <Input
              label="NIF / Identificação Fiscal *"
              placeholder="Ex: 5412345678"
              error={errors.nif?.message}
              {...register("nif")}
            />
          </div>

          <div>
            <Textarea
              label="Endereço / Sede"
              placeholder="Ex: Rua Rainha Ginga, Edifício Kilamba, 4.º Andar, Luanda"
              rows={3}
              error={errors.address?.message}
              {...register("address")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Cidade"
              placeholder="Ex: Luanda"
              error={errors.city?.message}
              {...register("city")}
            />
            <Input
              label="País"
              placeholder="Ex: Angola"
              error={errors.country?.message}
              {...register("country")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Correio Eletrónico"
              type="email"
              placeholder="Ex: financeiro@empresa.ao"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Telefone / Telemóvel"
              placeholder="Ex: +244 923 000 000"
              error={errors.phone?.message}
              {...register("phone")}
            />
          </div>
        </form>

        <SheetFooter className="p-4 border-t shrink-0 flex flex-row justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createClientMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="client-form"
            disabled={createClientMutation.isPending}
          >
            {createClientMutation.isPending && (
              <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent inline-block" />
            )}
            Registar Cliente
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
