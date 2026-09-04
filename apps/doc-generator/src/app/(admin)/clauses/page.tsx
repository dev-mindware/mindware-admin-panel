"use client";

import React, { useState, useTransition, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import {
  PageWrapper,
  TitleList,
  GenericTable,
  DynamicDrawer,
  Button,
  Input,
  Textarea,
  Badge,
  Icon,
  Card,
  Column,
  EmptyState,
} from "@workspace/ui";
import { clausesService, Clause } from "@/services/clauses-service";
import { toast } from "sonner";

function ClausesContent() {
  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(8),
    search: parseAsString.withDefault(""),
    category: parseAsString.withDefault("ALL"),
  });

  const [isPending, startTransition] = useTransition();

  const { page, limit, search: searchParam, category: categoryFilter } = params;

  const [search, setSearch] = useState(searchParam);
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);

  const { data: clausesResponse, isLoading } = useQuery({
    queryKey: ["clauses", page, limit, searchParam, categoryFilter],
    queryFn: () =>
      clausesService.getClauses({
        page,
        limit,
        search: searchParam || undefined,
        categoryId: categoryFilter !== "ALL" ? categoryFilter : undefined,
      }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["clause-categories"],
    queryFn: () => clausesService.getCategories(),
  });

  const clauses = clausesResponse?.data || [];
  const total = clausesResponse?.total || 0;
  const totalPages = clausesResponse?.totalPages || 1;

  const updateParams = (newParams: Partial<typeof params>) => {
    startTransition(() => {
      setParams((prev) => ({ ...prev, ...newParams }));
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search, page: 1 });
  };

  const columns: Column<Clause>[] = [
    {
      key: "applicableType",
      header: "Aplicação",
      className: "w-32",
      render: (_, item) => (
        <span className="font-mono text-xs font-semibold text-primary px-2 py-0.5 rounded bg-primary/10">
          {item.applicableType || "GERAL"}
        </span>
      ),
    },
    {
      key: "title",
      header: "Título da Cláusula",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm">{item.title}</span>
          <span className="text-xs text-muted-foreground line-clamp-1 max-w-lg">
            {item.contentMarkdown}
          </span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Categoria",
      render: (_, item) => (
        <Badge variant="secondary" className="font-medium text-xs">
          {item.category?.name || "Geral"}
        </Badge>
      ),
    },
    {
      key: "action",
      header: "Ações",
      className: "text-right",
      render: (_, item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedClause(item)}
            className="gap-1.5 text-xs h-8 cursor-pointer hover:bg-muted"
          >
            <Icon name="Eye" size={13} className="text-muted-foreground" />
            <span>Ver Detalhes</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(item.contentMarkdown);
              toast.success("Texto copiado para a área de transferência!");
            }}
            className="gap-1 text-xs h-8 cursor-pointer"
            title="Copiar texto da cláusula"
          >
            <Icon name="Copy" size={13} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-12 text-center flex flex-col items-center justify-center">
      <div className="space-y-6">
        <TitleList
          title="Biblioteca de Cláusulas Jurídicas"
          suTitle="Catálogo oficial de termos e condições para propostas comerciais e contratos"
        />

        {/* Toolbar de Filtros */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-96">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Pesquisar cláusula por título ou conteúdo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
          </form>

          {/* Categorias Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
            <Button
              variant={categoryFilter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => updateParams({ category: "ALL", page: 1 })}
              className="text-xs h-8 cursor-pointer shrink-0"
            >
              Todas ({total})
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={categoryFilter === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => updateParams({ category: cat.id, page: 1 })}
                className="text-xs h-8 cursor-pointer shrink-0"
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Tabela de Cláusulas */}
        {isLoading ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
            <span className="text-xs text-muted-foreground">
              A carregar cláusulas do repositório...
            </span>
          </Card>
        ) : clauses.length > 0 ? (
          <GenericTable<Clause>
            data={clauses}
            columns={columns}
            total={total}
            totalPages={totalPages}
            page={page}
            setPage={(p: number) => updateParams({ page: p })}
            goToNextPage={() => updateParams({ page: Math.min(totalPages, page + 1) })}
            goToPreviousPage={() => updateParams({ page: Math.max(1, page - 1) })}
            emptyTitle="Nenhuma cláusula encontrada"
            emptyDescription="Nenhum registo coincide com os filtros aplicados."
          />
        ) : (
          <EmptyState
            title="Sem cláusulas encontradas"
            description={
              searchParam || categoryFilter !== "ALL"
                ? "Nenhum registo coincide com o filtro de pesquisa ou categoria selecionada."
                : "Consulte ou selecione cláusulas nas propostas."
            }
            icon="Layers"
          />
        )}
      </div>

      {/* Drawer com Detalhes da Cláusula */}
      {selectedClause && (
        <DynamicDrawer
          open={!!selectedClause}
          onOpenChange={(val) => !val && setSelectedClause(null)}
          side="right"
          className="sm:max-w-md md:max-w-lg"
          title={selectedClause?.title || "Detalhes da Cláusula"}
          description={`Categoria: ${selectedClause?.category?.name || "Geral"}`}
        >
          <div className="space-y-4 pt-2">
            <div className="flex justify-end pb-2">
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(selectedClause.contentMarkdown);
                  toast.success("Texto copiado com sucesso!");
                }}
                className="gap-1.5 text-xs h-8 cursor-pointer"
              >
                <Icon name="Copy" size={13} />
                <span>Copiar</span>
              </Button>
            </div>
            <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wide">
                  Enquadramento & Redacção Jurídica Oficial
                </span>
                <Badge variant="outline" className="text-[10px]">
                  Legislação Angolana
                </Badge>
              </div>
              <p className="text-xs text-foreground/90 font-mono whitespace-pre-wrap leading-relaxed">
                {selectedClause.contentMarkdown}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground flex items-start gap-2.5">
              <Icon name="Info" size={16} className="text-primary shrink-0 mt-0.5" />
              <span>
                Esta cláusula está ativa no catálogo institucional da Mindware e é automaticamente incluída na secção final de Termos e Condições das propostas e contratos emitidos.
              </span>
            </div>
          </div>
        </DynamicDrawer>
      )}
    </div>
  );
}

export default function ClausesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <Card className="p-12 text-center flex flex-col items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
            <span className="text-xs text-muted-foreground">
              A inicializar catálogo de termos e cláusulas...
            </span>
          </Card>
        </div>
      }
    >
      <ClausesContent />
    </Suspense>
  );
}
