"use client";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { SearchHandlerWrapper, Icon } from "@/components";
import { FilterPopover } from "@/components/shared";
import { useCompanyFilters } from "@/hooks/company";
import { cn } from "@/lib/utils";

export function CompanyFilters({
    hasData = true
}: {
    hasData?: boolean;
}) {
    const { filters, setFilters, clearAllFilters, hasFilter } = useCompanyFilters();

    return (
        <div
            className={cn(
                "w-full flex flex-col gap-4",
                !hasData && !hasFilter && "pointer-events-none opacity-50"
            )}
        >
            <div className="flex flex-col lg:flex-row gap-4 items-baseline">
                <SearchHandlerWrapper
                    search={filters.search || ""}
                    setSearch={(search) => setFilters({ search })}
                    placeholder="Pesquisar por nome ou email..."
                    className="w-full lg:max-w-[400px]"
                />

                <FilterPopover
                    icon="Tag"
                    label="Status"
                    options={[
                        { value: "all", label: "Todos" },
                        { value: "true", label: "Ativo" },
                        { value: "false", label: "Inativo" },
                    ]}
                    value={filters.isActive === null ? "all" : filters.isActive.toString()}
                    onChange={(isActive) => setFilters({ isActive: isActive === "all" ? null : isActive === "true" })}
                />

                <FilterPopover
                    icon="List"
                    label="Ordenar por"
                    value={filters.sortBy || undefined}
                    options={[
                        { value: "name", label: "Nome" },
                        { value: "email", label: "Email" },
                        { value: "createdAt", label: "Data de Criação" },
                        { value: "updatedAt", label: "Última Atualização" },
                    ]}
                    onChange={(sortBy) => setFilters({ sortBy })}
                />

                <FilterPopover
                    label="Ordem"
                    icon="ArrowDownUp"
                    options={[
                        { value: "asc", label: "Crescente" },
                        { value: "desc", label: "Decrescente" },
                    ]}
                    value={filters.sortOrder || undefined}
                    onChange={(sortOrder) => setFilters({ sortOrder })}
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
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={clearAllFilters}
                        className="h-10 text-destructive hover:text-destructive px-4"
                    >
                        <Icon name="X" className="w-4 h-4 mr-2" />
                        Limpar Filtros
                    </Button>
                </div>
            )}
        </div>
    );
}
