"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { usersService } from "@/services/users-service";
import { DOCUMENT_TYPES } from "@/constants/document-types";

const ALL_ROLES = ["EDITOR", "ADMIN"] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EDITOR" as "EDITOR" | "ADMIN",
    allowedDocumentTypes: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => usersService.create(form),
    onSuccess: () => {
      setForm({ name: "", email: "", password: "", role: "EDITOR", allowedDocumentTypes: [] });
      setError(null);
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || "Erro ao criar utilizador");
    },
  });

  const toggleDocType = (slug: string) => {
    setForm((f) => ({
      ...f,
      allowedDocumentTypes: f.allowedDocumentTypes.includes(slug)
        ? f.allowedDocumentTypes.filter((s) => s !== slug)
        : [...f.allowedDocumentTypes, slug],
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl border bg-card shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Criar Novo Utilizador</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">✕</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nome</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="João Silva"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="joao@empresa.ao"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Senha Inicial</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mín. 8 caracteres"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Papel</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="EDITOR">Editor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>

          {form.role === "EDITOR" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tipos de Documentos Permitidos
                <span className="ml-1 text-xs text-muted-foreground">(selecione pelo menos um)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DOCUMENT_TYPES.map((dt) => {
                  const checked = form.allowedDocumentTypes.includes(dt.slug);
                  return (
                    <label
                      key={dt.slug}
                      className={`flex items-center gap-2.5 rounded-lg border p-2.5 cursor-pointer transition-all ${checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDocType(dt.slug)}
                        className="rounded border-input"
                      />
                      <span className="text-sm font-medium">{dt.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.name || !form.email || !form.password}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending ? "A criar..." : "Criar Utilizador"}
          </button>
        </div>
      </div>
    </div>
  );
}
