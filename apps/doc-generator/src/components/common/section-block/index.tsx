import type { ReactNode } from "react";
import { icons } from "lucide-react";
import { Icon } from "@workspace/ui";
import { cn } from "@workspace/utils";

interface SectionBlockProps {
  title: string;
  description?: string;
  icon?: keyof typeof icons;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Bloco de secção limpo (estilo canónico MindSchool/MindGest):
 * Sem fundo acinzentado de Card e sem bordas pesadas.
 * O conteúdo fica livre e harmonioso diretamente sobre o fundo da página.
 */
export function SectionBlock({
  title,
  description,
  icon,
  action,
  children,
  className,
}: SectionBlockProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-row items-start justify-between gap-3 pb-1 border-b border-border/40">
        <div className="min-w-0 space-y-0.5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {icon && <Icon name={icon} className="size-4 text-primary shrink-0" />}
            <span>{title}</span>
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

