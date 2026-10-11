"use client";

import type { ReactNode } from "react";
import { Icon } from "../common/icon";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export interface ToolbarFilter {
  key: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
}

interface FilterToolbarProps {
  search?: { value: string; onChange: (value: string) => void; placeholder?: string };
  filters?: ToolbarFilter[];
  /** Mostra «Limpar» quando há filtros ou pesquisa activos. */
  onClear?: () => void;
  /** Acções à direita (exportar, criar…). */
  children?: ReactNode;
}

/**
 * Barra de pesquisa e filtros de todas as listas do painel: pesquisa + selecções com etiqueta + limpar, numa só linha (quebra no telemóvel).
 * O estado vive no chamador (idealmente no URL, com `nuqs`), para a página se poder partilhar e recarregar.
 */
export function FilterToolbar({ search, filters = [], onClear, children }: FilterToolbarProps) {
  const active = Boolean(search?.value) || filters.some((f) => f.value);
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 lg:flex-row lg:items-end">
      {search && (
        <div className="relative min-w-0 flex-1 lg:max-w-sm">
          <Icon name="Search" className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder ?? "Pesquisar…"}
            className="bg-background pl-8"
            aria-label="Pesquisar"
          />
        </div>
      )}
      <div className="flex flex-wrap items-end gap-3">
        {filters.map((f) => (
          <div key={f.key} className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">{f.label}</Label>
            <Select value={f.value || "all"} onValueChange={(v) => f.onChange(v === "all" ? "" : v)}>
              <SelectTrigger className="h-9 w-[170px] bg-background">
                <SelectValue placeholder={f.placeholder ?? "Todos"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{f.placeholder ?? "Todos"}</SelectItem>
                {f.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        {onClear && active && (
          <Button type="button" variant="ghost" size="sm" onClick={onClear} className="gap-1.5">
            <Icon name="X" className="size-3.5" />
            Limpar
          </Button>
        )}
      </div>
      {children && <div className="flex items-center gap-2 lg:ml-auto">{children}</div>}
    </div>
  );
}
