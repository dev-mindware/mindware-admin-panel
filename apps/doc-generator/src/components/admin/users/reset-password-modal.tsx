"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { usersService } from "@/services/users-service";
import { AdminUser } from "@/types/user";

interface Props {
  user: AdminUser;
  onClose: () => void;
}

export function ResetPasswordModal({ user, onClose }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => usersService.resetPassword(user.id, newPassword),
    onSuccess: () => {
      onClose();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || "Erro ao redefinir senha");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-xl border bg-card shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Redefinir Senha</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <p className="text-sm text-muted-foreground">
          Nova senha para <span className="font-medium text-foreground">{user.name}</span>
        </p>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Nova Senha</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
        )}

        <div className="flex justify-end gap-3 pt-1 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-md border hover:bg-muted transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || newPassword.length < 8}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? "A redefinir..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
