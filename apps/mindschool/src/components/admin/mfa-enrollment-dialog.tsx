"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui";
import { MFA_ENROLLMENT_EVENT } from "@/services/api";
import { useMe } from "@/hooks/auth/use-me";

const DISMISSED_KEY = "mfa-enrollment-dismissed";
const wasDismissed = () => {
  try {
    return sessionStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
};
const remember = () => {
  try {
    sessionStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    /* sem armazenamento: volta a perguntar */
  }
};

/**
 * Convida a activar o segundo factor logo após o início de sessão (a API exige-o aos administradores em produção) e volta a abrir se uma
 * chamada for recusada por esse motivo. Na página «A minha conta» não aparece: aí é que se activa.
 */
export function MfaEnrollmentDialog() {
  const pathname = usePathname();
  const { me, refetch } = useMe();
  const [dismissed, setDismissed] = useState(wasDismissed);
  const [forced, setForced] = useState(false);
  const required = me?.mfa_enrollment_required === true;
  const open = forced || (required && !dismissed);

  useEffect(() => {
    void refetch();
  }, [pathname, refetch]);
  useEffect(() => {
    const on = () => setForced(true);
    window.addEventListener(MFA_ENROLLMENT_EVENT, on);
    return () => window.removeEventListener(MFA_ENROLLMENT_EVENT, on);
  }, []);

  const close = () => {
    remember();
    setDismissed(true);
    setForced(false);
  };

  return (
    <Dialog open={open && !pathname.startsWith("/account")} onOpenChange={(o) => !o && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Proteja a sua conta com o segundo factor</DialogTitle>
          <DialogDescription>
            O seu perfil exige verificação em dois passos. Leva um minuto: em «A minha conta», escolha «Configurar autenticador» e leia o código QR com uma aplicação
            (Google Authenticator, Microsoft Authenticator, 1Password…). Até lá, algumas áreas ficam indisponíveis.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>
            Mais tarde
          </Button>
          <Button asChild onClick={close}>
            <Link href="/account">Activar agora</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
