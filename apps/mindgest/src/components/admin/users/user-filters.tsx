"use client";

import { Button, DatePicker, FilterPopover, Input } from "@workspace/ui";
import { cn } from "@workspace/utils";
import { Icon, SearchHandlerWrapper } from "@/components";
import { useUserFilters } from "@/hooks/users";

export function UserFilters({ hasData = true }: { hasData?: boolean }) {
  const { filters, setFilters, clearAllFilters, hasFilter } = useUserFilters();

  return (
    <div className={cn("w-full space-y-4", !hasData && !hasFilter && "pointer-events-none opacity-50")}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SearchHandlerWrapper
          search={filters.search || ""}
          setSearch={(search) => setFilters({ search })}
          placeholder="Pesquisar por nome ou email..."
        />
        <Input
          value={filters.companyId || ""}
          onChange={(event) => setFilters({ companyId: event.target.value })}
          placeholder="ID da empresa"
          className="h-10"
        />
        <Input
          value={filters.storeId || ""}
          onChange={(event) => setFilters({ storeId: event.target.value })}
          placeholder="ID da loja"
          className="h-10"
        />
        <FilterPopover
          icon="ShieldCheck"
          label="Papel"
          value={filters.role || undefined}
          options={[
            { value: "OWNER", label: "Proprietário" },
            { value: "MANAGER", label: "Gestor" },
            { value: "CASHIER", label: "Caixa" },
          ]}
          onChange={(role) => setFilters({ role: role as "OWNER" | "MANAGER" | "CASHIER" })}
        />
        <FilterPopover
          icon="Tag"
          label="Estado"
          value={filters.status || undefined}
          options={[
            { value: "ACTIVE", label: "Activo" },
            { value: "INACTIVE", label: "Inactivo" },
            { value: "PENDING", label: "Pendente" },
            { value: "SUSPENDED", label: "Suspenso" },
          ]}
          onChange={(status) => setFilters({ status: status as "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED" })}
        />
        <FilterPopover
          icon="List"
          label="Ordenar por"
          value={filters.sortBy || undefined}
          options={[
            { value: "name", label: "Nome" },
            { value: "email", label: "Email" },
            { value: "role", label: "Papel" },
            { value: "status", label: "Estado" },
            { value: "createdAt", label: "Data de criação" },
            { value: "updatedAt", label: "Última actualização" },
          ]}
          onChange={(sortBy) => setFilters({ sortBy: sortBy as NonNullable<typeof filters.sortBy> })}
        />
        <FilterPopover
          icon="ArrowDownUp"
          label="Ordem"
          value={filters.sortOrder || undefined}
          options={[
            { value: "asc", label: "Crescente" },
            { value: "desc", label: "Decrescente" },
          ]}
          onChange={(sortOrder) => setFilters({ sortOrder: sortOrder as "asc" | "desc" })}
        />
        <DatePicker
          value={filters.createdAfter ? new Date(filters.createdAfter) : undefined}
          onChange={(_, formatted) => setFilters({ createdAfter: formatted })}
          placeholder="Criado depois de..."
        />
        <DatePicker
          value={filters.createdBefore ? new Date(filters.createdBefore) : undefined}
          onChange={(_, formatted) => setFilters({ createdBefore: formatted })}
          placeholder="Criado antes de..."
        />
      </div>

      {hasFilter && (
        <Button size="sm" variant="outline" onClick={clearAllFilters} className="h-10 text-destructive hover:text-destructive">
          <Icon name="X" className="mr-2 size-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
