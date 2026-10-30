"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, DynamicDrawer, Input } from "@workspace/ui";
import { usersService } from "@/services/users-service";
import type { AdminUser } from "@/types/user";

interface Props {
  user: AdminUser | null;
  onClose: () => void;
}

export function ResetPasswordModal({ user, onClose }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNewPassword("");
    setError(null);
  }, [user]);

  const mutation = useMutation({
    mutationFn: () => usersService.resetPassword((user as AdminUser).id, newPassword),
    onSuccess: onClose,
    onError: (err: any) => setError(err?.response?.data?.message || "Erro ao redefinir senha"),
  });

  return (
    <DynamicDrawer
      open={user !== null}
      onOpenChange={(v) => !v && onClose()}
      side="right"
      title="Redefinir Senha"
      description={user ? `Nova senha para ${user.name}` : undefined}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <Input
          label="Nova senha *"
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        {error && <p role="alert">{error}</p>}
        <Button type="submit" disabled={mutation.isPending || newPassword.length < 8}>
          {mutation.isPending ? "A guardar..." : "Redefinir Senha"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      </form>
    </DynamicDrawer>
  );
}
