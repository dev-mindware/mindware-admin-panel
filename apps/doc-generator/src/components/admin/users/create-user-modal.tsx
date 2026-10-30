"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, DynamicDrawer, FormSection, Input, MultiSelect, SelectField } from "@workspace/ui";
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
    <DynamicDrawer
      open={open}
      onOpenChange={(v) => !v && onClose()}
      side="right"
      title="Novo Utilizador"
      description="Defina os dados de acesso e o que este utilizador pode fazer"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <FormSection icon="UserPlus" title="Dados de acesso" columns={2}>
          <Input label="Nome *" placeholder="Ex: João Silva" value={form.name} onChange={(e) => set("name", e.target.value)} />
          <Input label="Email *" type="email" placeholder="joao@empresa.ao" value={form.email} onChange={(e) => set("email", e.target.value)} />
          <Input label="Senha inicial *" type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={(e) => set("password", e.target.value)} />
          <SelectField label="Papel" value={form.role} options={ROLE_OPTIONS} onValueChange={(v) => set("role", v as Role)} />
        </FormSection>

        {form.role === "EDITOR" && (
          <FormSection icon="ScrollText" title="Documentos permitidos" description="Seleccione pelo menos um tipo." columns={1}>
            <MultiSelect
              label="Tipos de documentos"
              placeholder="Seleccionar tipos"
              options={DOC_OPTIONS}
              value={DOC_OPTIONS.filter((o) => form.allowedDocumentTypes.includes(o.value))}
              onChange={(opts) => set("allowedDocumentTypes", opts.map((o) => o.value))}
            />
          </FormSection>
        )}

        {error && <p role="alert">{error}</p>}

        <Button type="submit" disabled={mutation.isPending || !form.name || !form.email || !form.password}>
          {mutation.isPending ? "A criar..." : "Criar Utilizador"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      </form>
    </DynamicDrawer>
  );
}
