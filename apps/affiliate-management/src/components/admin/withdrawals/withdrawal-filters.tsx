"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@workspace/ui";
import { Search, Filter, X, RotateCcw, Calendar, HandCoins } from "lucide-react";
import { WithdrawalStatus } from "@workspace/types/affiliate";
import { useDebounce } from "use-debounce";

interface WithdrawalFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  createdFrom: string;
  onCreatedFromChange: (value: string) => void;
  createdTo: string;
  onCreatedToChange: (value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  activeCount: number;
  total?: number;
}

export function WithdrawalFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  createdFrom,
  onCreatedFromChange,
  createdTo,
  onCreatedToChange,
  onClear,
  hasActiveFilters,
  activeCount,
  total,
}: WithdrawalFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const [debouncedSearch] = useDebounce(localSearch, 300);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== search) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, search, onSearchChange]);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState({
    status,
    createdFrom,
    createdTo,
  });

  const handleOpenSheet = (open: boolean) => {
    if (open) {
      setDraftFilters({
        status,
        createdFrom,
        createdTo,
      });
    }
    setIsSheetOpen(open);
  };

  const handleApplyDraft = () => {
    onStatusChange(draftFilters.status);
    onCreatedFromChange(draftFilters.createdFrom);
    onCreatedToChange(draftFilters.createdTo);
    setIsSheetOpen(false);
  };

  const handleClearDraft = () => {
    setDraftFilters({
      status: "ALL",
      createdFrom: "",
      createdTo: "",
    });
    setLocalSearch("");
    onClear();
    setIsSheetOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Search and Mobile Trigger */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por afiliado, email, código, IBAN ou banco..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 pr-9 h-10 bg-card border-border/80 focus-visible:ring-primary/20 text-sm"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="sm:hidden flex items-center">
          <Button
            type="button"
            variant={hasActiveFilters ? "default" : "outline"}
            onClick={() => handleOpenSheet(true)}
            className="h-10 px-3.5 gap-2 relative shrink-0"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-primary text-xs font-semibold">
                {activeCount}
              </span>
            )}
          </Button>
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setLocalSearch("");
              onClear();
            }}
            className="hidden sm:flex h-10 px-3 text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Limpar filtros
          </Button>
        )}

        {typeof total === "number" && (
          <div className="hidden md:flex items-center text-xs text-muted-foreground shrink-0 px-2 py-1 bg-muted/40 rounded-md border">
            <span className="font-medium text-foreground mr-1">{total}</span> solicitações
          </div>
        )}
      </div>

      {/* Desktop Filter Bar */}
      <div className="hidden sm:flex flex-wrap items-center gap-2.5 bg-card/60 p-2.5 rounded-xl border border-border/70 text-sm">
        {/* Status */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Estado:</span>
          <Select value={status || "ALL"} onValueChange={onStatusChange}>
            <SelectTrigger className="h-8 w-[150px] text-xs bg-background">
              <SelectValue placeholder="Todos os estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os estados</SelectItem>
              <SelectItem value={WithdrawalStatus.PENDING}>Pendente</SelectItem>
              <SelectItem value={WithdrawalStatus.APPROVED}>Aprovado</SelectItem>
              <SelectItem value={WithdrawalStatus.REJECTED}>Rejeitado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range: De / Até */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs font-medium text-muted-foreground">Desde:</span>
          <input
            type="date"
            value={createdFrom || ""}
            onChange={(e) => onCreatedFromChange(e.target.value)}
            className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-xs font-medium text-muted-foreground">Até:</span>
          <input
            type="date"
            value={createdTo || ""}
            onChange={(e) => onCreatedToChange(e.target.value)}
            className="h-8 px-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={handleOpenSheet}>
        <SheetContent side="bottom" className="max-h-[90dvh] p-0 rounded-t-2xl flex flex-col">
          <SheetHeader className="p-5 border-b shrink-0 text-left">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-base font-semibold">Filtros de Levantamento</SheetTitle>
                <SheetDescription className="text-xs">
                  Filtre por estado da solicitação ou período de datas
                </SheetDescription>
              </div>
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs">
                  {activeCount} ativo{activeCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Estado */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <HandCoins className="h-3.5 w-3.5" /> Estado do Levantamento
              </label>
              <Select
                value={draftFilters.status || "ALL"}
                onValueChange={(val) => setDraftFilters((prev) => ({ ...prev, status: val }))}
              >
                <SelectTrigger className="h-10 text-sm bg-background w-full">
                  <SelectValue placeholder="Todos os estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os estados</SelectItem>
                  <SelectItem value={WithdrawalStatus.PENDING}>Pendente</SelectItem>
                  <SelectItem value={WithdrawalStatus.APPROVED}>Aprovado</SelectItem>
                  <SelectItem value={WithdrawalStatus.REJECTED}>Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Período */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Data da Solicitação
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-muted-foreground">Desde</span>
                  <input
                    type="date"
                    value={draftFilters.createdFrom || ""}
                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, createdFrom: e.target.value }))}
                    className="w-full h-10 px-3 text-xs rounded-md border border-input bg-background"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Até</span>
                  <input
                    type="date"
                    value={draftFilters.createdTo || ""}
                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, createdTo: e.target.value }))}
                    className="w-full h-10 px-3 text-xs rounded-md border border-input bg-background"
                  />
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="p-4 border-t shrink-0 flex flex-row items-center justify-between gap-3 bg-card/50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearDraft}
              className="flex-1 text-xs"
            >
              Limpar tudo
            </Button>
            <Button
              type="button"
              onClick={handleApplyDraft}
              className="flex-1 text-xs font-medium"
            >
              Aplicar filtros
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
