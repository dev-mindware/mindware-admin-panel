import type { ReactNode } from "react";
import { icons } from "lucide-react";
import { Icon } from "../common/icon";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@workspace/utils";

interface PanelProps {
  title: string;
  description?: string;
  icon?: keyof typeof icons;
  /** Acção ou ligação no canto (ex.: «Ver todas»). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

/** Cartão de secção dos dashboards e das fichas: título, descrição, acção e conteúdo; sempre com o mesmo cabeçalho. */
export function Panel({ title, description, icon, action, children, className, contentClassName }: PanelProps) {
  return (
    <Card className={cn("gap-3 py-4 shadow-none", className)}>
      <CardHeader className="flex-row items-start justify-between gap-3 px-4">
        <div className="min-w-0 space-y-1">
          <CardTitle className="flex items-center gap-2 text-sm">
            {icon && <Icon name={icon} className="size-4 text-primary" />}
            {title}
          </CardTitle>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardHeader>
      <CardContent className={cn("px-4", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
