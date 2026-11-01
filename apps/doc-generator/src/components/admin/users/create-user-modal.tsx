"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  ButtonSubmit,
  FormSection,
  Input,
  MultiSelect,
  SelectField,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@workspace/ui";
import { usersService } from "@/services/users-service";
import { DOCUMENT_TYPES } from "@/constants/document-types";
import type { CreateUserPayload } from "@/types/user";

type Role = NonNullable<CreateUserPayload["role"]>;

const EMPTY = { name: "", email: "", password: "", role: "EDITOR" as Role, allowedDocumentTypes: [] as string[] };

const ROLE_OPTIONS = [
  { value: "EDITOR", label: "Editor" },
  { value: "MANAGER", label: "Gestor" },
  { value: "ADMIN", label: "Administrador" },
];

const DOC_OPTIONS = DOCUMENT_TYPES.map((d) => ({ value: d.slug, label: d.name }));

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setError(null);
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: () => usersService.create(form),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (err: any) => setError(err?.response?.data?.message || "Erro ao criar utilizador"),
  });

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 border-b shrink-0 text-left">
          <SheetTitle>Novo Utilizador</SheetTitle>
          <SheetDescription>
            Defina os dados de acesso e as permissões de emissão deste utilizador.
          </SheetDescription>
        </SheetHeader>

        <form
          id="create-user-form"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          <FormSection icon="UserPlus" title="Dados de acesso" columns={2}>
            <Input
              label="Nome *"
              placeholder="Ex: João Silva"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            <Input
              label="Correio Eletrónico *"
              type="email"
              placeholder="Ex: joao@empresa.ao"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
            <Input
              label="Senha Inicial *"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
            <SelectField
              label="Perfil de Acesso"
              value={form.role}
              options={ROLE_OPTIONS}
              onValueChange={(v) => set("role", v as Role)}
            />
          </FormSection>

          {form.role === "EDITOR" && (
            <FormSection
              icon="ScrollText"
              title="Documentos permitidos"
              description="Selecione pelo menos um tipo de documento para este editor."
              columns={1}
            >
              <MultiSelect
                label="Tipos de documentos"
                placeholder="Selecionar tipos"
                options={DOC_OPTIONS}
                value={DOC_OPTIONS.filter((o) => form.allowedDocumentTypes.includes(o.value))}
                onChange={(opts) => set("allowedDocumentTypes", opts.map((o) => o.value))}
              />
            </FormSection>
          )}

          {error && (
            <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-xs">
              {error}
            </div>
          )}
        </form>

        <SheetFooter className="p-4 border-t shrink-0 flex flex-row justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="create-user-form"
            disabled={mutation.isPending || !form.name || !form.email || !form.password}
          >
            {mutation.isPending && (
              <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent inline-block" />
            )}
            Criar Utilizador
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
