"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Input,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@workspace/ui";
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
    <Sheet open={user !== null} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 border-b shrink-0 text-left">
          <SheetTitle>Redefinir Senha</SheetTitle>
          <SheetDescription>
            {user ? `Defina uma nova palavra-passe segura para ${user.name}` : undefined}
          </SheetDescription>
        </SheetHeader>

        <form
          id="reset-password-form"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          <Input
            label="Nova Palavra-passe *"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
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
            form="reset-password-form"
            disabled={mutation.isPending || newPassword.length < 8}
          >
            {mutation.isPending && (
              <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent inline-block" />
            )}
            Redefinir Senha
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
