"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { STEP_UP_REQUEST_EVENT, completeStepUp, type StepUpRequest } from "@workspace/hooks";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";

interface StepUpDialogProps {
  /** Troca palavra-passe (e código do 2.º factor) por um token de curta duração. Rejeita com a mensagem a mostrar. */
  authenticate: (input: { password: string; code?: string }) => Promise<{ token: string; expiresIn: number }>;
}

/**
 * Janela de reautenticação das operações críticas. Montada uma só vez no layout: escuta o pedido do cliente HTTP
 * (`requestStepUp`), valida a identidade e devolve o token; cancelar rejeita o pedido original.
 */
export function StepUpDialog({ authenticate }: StepUpDialogProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const request = useRef<StepUpRequest | null>(null);

  useEffect(() => {
    const onRequest = (e: Event) => {
      request.current = (e as CustomEvent<StepUpRequest>).detail;
      setPassword("");
      setCode("");
      setError(null);
      setOpen(true);
    };
    window.addEventListener(STEP_UP_REQUEST_EVENT, onRequest);
    return () => window.removeEventListener(STEP_UP_REQUEST_EVENT, onRequest);
  }, []);

  const close = (cancelled: boolean) => {
    setOpen(false);
    if (cancelled) request.current?.reject(new Error("Reautenticação cancelada."));
    request.current = null;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { token, expiresIn } = await authenticate({ password, ...(code.trim() ? { code: code.trim() } : {}) });
      completeStepUp(token, expiresIn);
      request.current?.resolve(token);
      request.current = null;
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível confirmar a sua identidade.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close(true)}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Confirme a sua identidade</DialogTitle>
            <DialogDescription>Esta operação é crítica. Introduza a sua palavra-passe (e o código do segundo factor, se o tiver) para continuar.</DialogDescription>
          </DialogHeader>
          <Input label="Palavra-passe" type="password" autoComplete="current-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Input label="Código do segundo factor (se activo)" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" value={code} onChange={(e) => setCode(e.target.value)} />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(true)}>
              Cancelar
            </Button>
            <Button type="submit" loading={busy} disabled={password.length === 0}>
              Confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
