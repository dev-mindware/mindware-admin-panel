"use client";

import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/services/users-service";
import { AdminUser } from "@/types/user";
import { DOCUMENT_TYPES } from "@/constants/document-types";
import { CreateUserModal } from "./create-user-modal";
import { ResetPasswordModal } from "./reset-password-modal";
import { Badge } from "@workspace/ui";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  EDITOR: "Editor",
};

const ROLE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ADMIN: "default",
  EDITOR: "secondary",
};

export function UserList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["users", page, search],
    queryFn: () => usersService.list({ page, limit: 20, search: search || undefined }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersService.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const docTypeLabel = useCallback((slug: string) => {
    const dt = DOCUMENT_TYPES.find((d) => d.slug === slug);
    return dt?.name || slug;
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-medium">Erro ao carregar utilizadores</p>
        <button onClick={() => refetch()} className="mt-2 text-sm underline text-muted-foreground">
          Tentar novamente
        </button>
      </div>
    );
  }

  const users = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      {/* Header & Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar por nome ou email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-9 w-72 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          + Novo Utilizador
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Papel</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipos Permitidos</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Docs</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  Nenhum utilizador encontrado
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={ROLE_VARIANT[user.role] ?? "secondary"}>
                      {ROLE_LABELS[user.role] || user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {user.role === "ADMIN" ? (
                      <span className="text-xs text-muted-foreground italic">Todos os tipos</span>
                    ) : user.allowedDocumentTypes.length === 0 ? (
                      <span className="text-xs text-destructive">Sem permissões</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.allowedDocumentTypes.map((slug) => (
                          <span key={slug} className="text-xs bg-muted rounded px-1.5 py-0.5">
                            {docTypeLabel(slug)}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${user.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                      <span className={`size-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                      {user.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user._count?.documents ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setResetTarget(user)}
                        className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
                      >
                        Reset senha
                      </button>
                      <span className="text-muted-foreground">|</span>
                      <button
                        onClick={() => toggleMutation.mutate({ id: user.id, isActive: !user.isActive })}
                        disabled={toggleMutation.isPending}
                        className={`text-xs underline-offset-4 hover:underline transition-colors ${user.isActive ? "text-destructive hover:text-destructive/80" : "text-emerald-600 hover:text-emerald-700"}`}
                      >
                        {user.isActive ? "Desativar" : "Ativar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{meta.total} utilizadores</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-1">
              {page} / {meta.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="px-3 py-1 rounded border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateUserModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
      />
      {resetTarget && (
        <ResetPasswordModal
          user={resetTarget}
          onClose={() => setResetTarget(null)}
        />
      )}
    </div>
  );
}
