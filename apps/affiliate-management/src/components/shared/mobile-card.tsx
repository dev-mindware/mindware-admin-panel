"use client";

import React from "react";
import { Icon } from "@workspace/ui";
import { icons } from "lucide-react";
import { cn } from "@workspace/utils";

export interface MobileCardField {
  label: string;
  value: React.ReactNode;
}

export interface MobileCardProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof icons;
  badge?: React.ReactNode;
  fields?: MobileCardField[];
  footerAction?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function MobileCard({
  title,
  subtitle,
  icon,
  badge,
  fields,
  footerAction,
  onClick,
  className,
}: MobileCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border bg-card p-4 shadow-xs space-y-3 transition-all",
        onClick && "cursor-pointer active:scale-[0.99] hover:border-primary/40",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {icon && (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name={icon as any} className="size-5" />
            </div>
          )}
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold text-foreground">{title}</h4>
            {subtitle && (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {fields && fields.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5 border-t pt-3 text-xs">
          {fields.map((f, idx) => (
            <div key={idx} className="min-w-0 space-y-0.5">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {f.label}
              </p>
              <div className="truncate text-xs font-semibold text-foreground">{f.value}</div>
            </div>
          ))}
        </div>
      )}

      {footerAction && (
        <div className="flex items-center justify-end border-t pt-2 text-xs">{footerAction}</div>
      )}
    </div>
  );
}
