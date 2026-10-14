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
import { Search, Filter, X, RotateCcw, Calendar, Users, Award, ShieldCheck, Tag } from "lucide-react";
import { AffiliateStatus } from "@workspace/types/affiliate";
import { useDebounce } from "use-debounce";

interface AffiliateFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  level: string;
  onLevelChange: (value: string) => void;
  certification: string;
  onCertificationChange: (value: string) => void;
  partnerType: string;
  onPartnerTypeChange: (value: string) => void;
  createdFrom: string;
  onCreatedFromChange: (value: string) => void;
  createdTo: string;
  onCreatedToChange: (value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  activeCount: number;
  total?: number;
}

export function AffiliateFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  level,
  onLevelChange,
  certification,
  onCertificationChange,
  partnerType,
  onPartnerTypeChange,
  createdFrom,
  onCreatedFromChange,
  createdTo,
  onCreatedToChange,
  onClear,
  hasActiveFilters,
  activeCount,
  total,
}: AffiliateFiltersProps) {
  // Local search with debounce
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

  // Mobile sheet draft state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState({
    status,
    level,
    certification,
    partnerType,
    createdFrom,
    createdTo,
  });

  const handleOpenSheet = (open: boolean) => {
    if (open) {
      setDraftFilters({
        status,
        level,
        certification,
        partnerType,
        createdFrom,
        createdTo,
      });
    }
    setIsSheetOpen(open);
  };

  const handleApplyDraft = () => {
    onStatusChange(draftFilters.status);
    onLevelChange(draftFilters.level);
    onCertificationChange(draftFilters.certification);
    onPartnerTypeChange(draftFilters.partnerType);
    onCreatedFromChange(draftFilters.createdFrom);
    onCreatedToChange(draftFilters.createdTo);
    setIsSheetOpen(false);
  };

  const handleClearDraft = () => {
    setDraftFilters({
      status: "ALL",
      level: "ALL",
      certification: "ALL",
      partnerType: "ALL",
      createdFrom: "",
      createdTo: "",
    });
    setLocalSearch("");
    onClear();
    setIsSheetOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Search and Mobile Filter Trigger */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome, email, código, telefone..."
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

        {/* Mobile Filter Button */}
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

        {/* Desktop Quick Clear */}
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
            <span className="font-medium text-foreground mr-1">{total}</span> afiliados
          </div>
        )}
      </div>

      {/* Desktop Filters Bar */}
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
              <SelectItem value={AffiliateStatus.PENDING_APPROVAL}>Pendente</SelectItem>
              <SelectItem value={AffiliateStatus.ACTIVE}>Ativo</SelectItem>
              <SelectItem value={AffiliateStatus.INACTIVE}>Inativo</SelectItem>
              <SelectItem value={AffiliateStatus.SUSPENDED}>Suspenso</SelectItem>
              <SelectItem value={AffiliateStatus.REJECTED}>Rejeitado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Nível de Parceiro */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Nível:</span>
          <Select value={level || "ALL"} onValueChange={onLevelChange}>
            <SelectTrigger className="h-8 w-[140px] text-xs bg-background">
              <SelectValue placeholder="Todos os níveis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os níveis</SelectItem>
              <SelectItem value="STARTER">Starter</SelectItem>
              <SelectItem value="BRONZE">Bronze</SelectItem>
              <SelectItem value="SILVER">Prata</SelectItem>
              <SelectItem value="GOLD">Ouro</SelectItem>
              <SelectItem value="PLATINUM">Platina</SelectItem>
              <SelectItem value="DIAMOND">Diamante</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Certificação */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Certificação:</span>
          <Select value={certification || "ALL"} onValueChange={onCertificationChange}>
            <SelectTrigger className="h-8 w-[155px] text-xs bg-background">
              <SelectValue placeholder="Todas as certificações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as certificações</SelectItem>
              <SelectItem value="approved">Certificado PRO</SelectItem>
              <SelectItem value="eligible">Elegível</SelectItem>
              <SelectItem value="not_eligible">Não elegível</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Parceiro */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Tipo:</span>
          <Select value={partnerType || "ALL"} onValueChange={onPartnerTypeChange}>
            <SelectTrigger className="h-8 w-[145px] text-xs bg-background">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os tipos</SelectItem>
              <SelectItem value="AFFILIATE">Afiliado Normal</SelectItem>
              <SelectItem value="PARTNER_PRO">Parceiro PRO</SelectItem>
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
                <SheetTitle className="text-base font-semibold">Filtros Avançados</SheetTitle>
                <SheetDescription className="text-xs">
                  Refine a consulta de afiliados com múltiplos critérios
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
                <Users className="h-3.5 w-3.5" /> Estado do Afiliado
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
                  <SelectItem value={AffiliateStatus.PENDING_APPROVAL}>Pendente de Aprovação</SelectItem>
                  <SelectItem value={AffiliateStatus.ACTIVE}>Ativo</SelectItem>
                  <SelectItem value={AffiliateStatus.INACTIVE}>Inativo</SelectItem>
                  <SelectItem value={AffiliateStatus.SUSPENDED}>Suspenso</SelectItem>
                  <SelectItem value={AffiliateStatus.REJECTED}>Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nível */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5" /> Nível de Parceiro
              </label>
              <Select
                value={draftFilters.level || "ALL"}
                onValueChange={(val) => setDraftFilters((prev) => ({ ...prev, level: val }))}
              >
                <SelectTrigger className="h-10 text-sm bg-background w-full">
                  <SelectValue placeholder="Todos os níveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os níveis</SelectItem>
                  <SelectItem value="STARTER">Starter</SelectItem>
                  <SelectItem value="BRONZE">Bronze</SelectItem>
                  <SelectItem value="SILVER">Prata</SelectItem>
                  <SelectItem value="GOLD">Ouro</SelectItem>
                  <SelectItem value="PLATINUM">Platina</SelectItem>
                  <SelectItem value="DIAMOND">Diamante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Certificação */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Certificação PRO
              </label>
              <Select
                value={draftFilters.certification || "ALL"}
                onValueChange={(val) => setDraftFilters((prev) => ({ ...prev, certification: val }))}
              >
                <SelectTrigger className="h-10 text-sm bg-background w-full">
                  <SelectValue placeholder="Todas as certificações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas as certificações</SelectItem>
                  <SelectItem value="approved">Certificado PRO</SelectItem>
                  <SelectItem value="eligible">Elegível</SelectItem>
                  <SelectItem value="not_eligible">Não elegível</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Parceiro */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Tipo de Parceiro
              </label>
              <Select
                value={draftFilters.partnerType || "ALL"}
                onValueChange={(val) => setDraftFilters((prev) => ({ ...prev, partnerType: val }))}
              >
                <SelectTrigger className="h-10 text-sm bg-background w-full">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os tipos</SelectItem>
                  <SelectItem value="AFFILIATE">Afiliado Normal</SelectItem>
                  <SelectItem value="PARTNER_PRO">Parceiro PRO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Período de Registo */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Data de Registo
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
