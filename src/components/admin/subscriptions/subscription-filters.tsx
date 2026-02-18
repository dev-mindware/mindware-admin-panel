"use client";

import { Button } from "@/components/ui/button";
import { SearchHandlerWrapper, Icon } from "@/components";
import { FilterPopover } from "@/components/shared";
import { useSubscriptionFilters } from "@/hooks/subscription/use-subscription-filters";
import { cn } from "@/lib/utils";

export function SubscriptionFilters({
    hasData = true
}: {
    hasData?: boolean;
}) {
    const { filters, setFilters, clearAllFilters, hasFilter } = useSubscriptionFilters();

    return (
        <div
            className={cn(
                "w-full flex flex-col gap-4",
                !hasData && !hasFilter && "pointer-events-none opacity-50"
            )}
        >
            <div className="flex flex-col lg:flex-row gap-4 items-baseline">
                <SearchHandlerWrapper
                    search={filters.company || ""}
                    setSearch={(company) => setFilters({ company })}
                    placeholder="Pesquisar por empresa..."
                    className="w-full lg:max-w-[400px]"
                />

                <FilterPopover
                    icon="Tag"
                    label="Status"
                    options={[
                        { value: "ACTIVE", label: "Ativa" },
                        { value: "TRIALING", label: "Em Teste" },
                        { value: "PENDING", label: "Pendente" },
                        { value: "EXPIRED", label: "Expirada" },
                        { value: "PAST_DUE", label: "Atrasada" },
                        { value: "CANCELLED", label: "Cancelada" },
                    ]}
                    value={filters.status || undefined}
                    onChange={(status) => setFilters({ status })}
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
