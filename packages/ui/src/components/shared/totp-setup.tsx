"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Icon } from "../common/icon";
import { Button } from "../ui/button";

export const TOTP_DIGITS = 6;

/** Só dígitos, no máximo 6 (colar «123 456» ou «123-456» também funciona). */
export const onlyDigits = (v: string) => v.replace(/\D/g, "").slice(0, TOTP_DIGITS);

/** Chave em grupos de 4 para ler e copiar à mão: «ABCD EFGH IJKL …». */
export const groupSecret = (secret: string) => secret.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();

const copy = (text: string, label: string) =>
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`${label} copiado.`))
    .catch(() => toast.error("Não foi possível copiar."));

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">{n}</span>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm font-medium">{title}</p>
        {children}
      </div>
    </li>
  );
}

interface TotpSetupProps {
  secret: { secret: string; otpauth_url: string };
  code: string;
  onCode: (value: string) => void;
  /** Evita um segundo envio enquanto o anterior está a decorrer. */
  busy: boolean;
}

/**
 * Passos para ligar o autenticador: instalar a aplicação, ler o código QR (ou copiar a chave, ou abrir a ligação no telemóvel)
 * e confirmar com 6 dígitos. O QR é desenhado no navegador a partir da ligação `otpauth://`: a chave não sai daqui.
 * Ao chegar ao 6.º dígito, o formulário que contém este bloco é submetido sozinho.
 */
export function TotpSetup({ secret, code, onCode, busy }: TotpSetupProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (canvas.current) void QRCode.toCanvas(canvas.current, secret.otpauth_url, { width: 184, margin: 1, color: { dark: "#000000", light: "#ffffff" } });
  }, [secret.otpauth_url]);

  const change = (raw: string) => {
    const v = onlyDigits(raw);
    onCode(v);
    if (v.length === TOTP_DIGITS && !busy) setTimeout(() => input.current?.form?.requestSubmit(), 0);
  };

  return (
    <ol className="space-y-5">
      <Step n={1} title="Instale uma aplicação de autenticação">
        <p className="text-xs text-muted-foreground">Google Authenticator, Microsoft Authenticator, Authy ou 1Password. Já tem uma? Passe ao passo seguinte.</p>
      </Step>

      <Step n={2} title="Leia o código QR com a aplicação">
        <div className="flex flex-wrap items-start gap-4">
          <div className="rounded-lg border bg-white p-2">
            <canvas ref={canvas} aria-label="Código QR para o autenticador" />
          </div>
          <div className="min-w-0 flex-1 space-y-2 text-xs text-muted-foreground">
            <p>Na aplicação, escolha «Adicionar conta» e depois «Ler código QR».</p>
            <p>Não consegue ler? Escreva a chave à mão:</p>
            <div className="flex items-center gap-2">
              <code className="select-all break-all rounded bg-muted px-2 py-1.5 font-mono text-xs text-foreground">{groupSecret(secret.secret)}</code>
              <Button type="button" size="icon" variant="ghost" title="Copiar a chave" onClick={() => void copy(secret.secret, "Chave")}>
                <Icon name="Copy" className="size-4" />
              </Button>
            </div>
            <a className="inline-flex items-center gap-1 underline" href={secret.otpauth_url}>
              <Icon name="Smartphone" className="size-3.5" />
              Está no telemóvel? Abrir directamente na aplicação
            </a>
          </div>
        </div>
      </Step>

      <Step n={3} title="Escreva o código de 6 dígitos que a aplicação mostra">
        <input
          ref={input}
          value={code}
          onChange={(e) => change(e.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={TOTP_DIGITS + 3}
          placeholder="000000"
          aria-label="Código de 6 dígitos"
          className="w-full rounded-md border bg-background px-3 py-2 text-center font-mono text-2xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-primary/40"
        />
        <p className="text-xs text-muted-foreground">O código muda a cada 30 segundos. Confirma sozinho ao escrever o 6.º dígito.</p>
      </Step>
    </ol>
  );
}

/** Conteúdo do ficheiro descarregado com os códigos de recuperação: um por linha, com aviso. */
export const recoveryCodesFile = (codes: readonly string[], now: Date = new Date()) =>
  `MindSchool: códigos de recuperação (${now.toISOString().slice(0, 10)})\nCada código serve uma só vez. Guarde este ficheiro num local seguro.\n\n${codes.join("\n")}\n`;

/** Códigos de recuperação do segundo factor, com copiar e descarregar (só se mostram esta vez). */
export function RecoveryCodes({ codes }: { codes: readonly string[] }) {
  const download = () => {
    const url = URL.createObjectURL(new Blob([recoveryCodesFile(codes)], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindschool-codigos-de-recuperacao.txt";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
        <Icon name="TriangleAlert" className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p>
          Se perder o telemóvel, estes códigos são a única forma de entrar. Cada um serve uma só vez e <strong>não voltam a ser mostrados</strong>.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/40 p-3 font-mono text-sm">
        {codes.map((c) => (
          <span key={c} className="select-all">
            {c}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" className="gap-2" onClick={() => void copy(codes.join("\n"), "Códigos")}>
          <Icon name="Copy" className="size-4" />
          Copiar todos
        </Button>
        <Button type="button" size="sm" variant="outline" className="gap-2" onClick={download}>
          <Icon name="Download" className="size-4" />
          Descarregar (.txt)
        </Button>
      </div>
    </div>
  );
}
