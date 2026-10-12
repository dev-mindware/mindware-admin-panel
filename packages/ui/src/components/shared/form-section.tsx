import type { ReactNode } from "react";
import { icons } from "lucide-react";
import { Icon } from "../common/icon";
import { cn } from "@workspace/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: keyof typeof icons;
  /** Número do passo (mostra um círculo numerado em vez do ícone). */
  step?: number;
  /** Colunas em ecrãs ≥ sm (por omissão 2; 1 para campos largos). */
  columns?: 1 | 2;
  children: ReactNode;
  className?: string;
}

/** Bloco de um formulário: cabeçalho (passo ou ícone, título, explicação) e grelha responsiva de campos. Um só padrão para todos os modais. */
export function FormSection({ title, description, icon, step, columns = 2, children, className }: FormSectionProps) {
  return (
    <section className={cn("space-y-3 rounded-lg border bg-muted/10 p-4", className)}>
      <header className="space-y-0.5">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          {step !== undefined ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-xs text-primary">{step}</span>
          ) : (
            icon && <Icon name={icon} className="size-4 text-primary" />
          )}
          {title}
        </h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </header>
      <div className={cn("grid grid-cols-1 gap-4", columns === 2 && "sm:grid-cols-2")}>{children}</div>
    </section>
  );
}
