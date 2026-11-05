"use client";

import React, { useState } from "react";
import {
  TitleList,
  Button,
  Badge,
  Icon,
  Column,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@workspace/ui";
import { Clause } from "@/services/clauses-service";
import { useClausesList, useClauseCategories } from "@/hooks/clauses";
import { DataList } from "@/components/common/data-list";
import { toast } from "sonner";

export function ClausesPageContent() {
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);

  // Carrega a totalidade de cláusulas para disponibilizar filtragem completa
  const { data: clausesResponse, isLoading, isError, refetch } = useClausesList({
    limit: 1000,
  });

  const { data: categories = [] } = useClauseCategories();

  const clauses = clausesResponse?.data || [];

  const columns: Column<Clause>[] = [
    {
      key: "applicableType",
      header: "Aplicação",
      className: "w-28",
      render: (_, item) => (
        <span className="font-mono text-xs font-semibold text-primary px-2 py-0.5 rounded bg-primary/10 inline-block w-fit">
          {item.applicableType || "GERAL"}
        </span>
      ),
    },
    {
      key: "title",
      header: "Título da Cláusula",
      render: (_, item) => (
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-foreground text-sm truncate">
            {item.title}
          </span>
          <span className="text-xs text-muted-foreground line-clamp-1">
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
            <Icon name="Eye" size={14} className="text-muted-foreground" />
            <span className="hidden sm:inline">Ver Detalhes</span>
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
            <Icon name="Copy" size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <TitleList
        title="Biblioteca de Cláusulas Jurídicas"
        suTitle="Catálogo oficial de termos e condições para propostas comerciais e contratos emitidos"
      />

      {/* Componente Canónico DataList: Filtros por categoria e aplicabilidade com Mobile Bottom Sheet */}
      <DataList<Clause>
        prefix="clausulas"
        rows={clauses}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        pageSize={10}
        searchPlaceholder="Pesquisar cláusula por título ou redação jurídica..."
        searchText={(c) => `${c.title} ${c.contentMarkdown} ${c.applicableType || ""} ${c.category?.name || ""}`}
        filters={[
          {
            key: "categoria",
            label: "Categoria",
            icon: "Layers",
            options: categories.map((cat) => ({
              value: cat.id,
              label: cat.name,
            })),
            match: (c, v) => c.categoryId === v,
          },
          {
            key: "aplicabilidade",
            label: "Aplicação",
            icon: "FileCheck",
            options: [
              { value: "PROPOSAL", label: "Propostas Comerciais" },
              { value: "CONTRACT", label: "Contratos de Prestação" },
              { value: "NDA", label: "Acordo de Confidencialidade" },
              { value: "GERAL", label: "Aplicação Geral" },
            ],
            match: (c, v) => (c.applicableType || "GERAL").toUpperCase() === v.toUpperCase(),
          },
        ]}
        sorts={[
          {
            value: "titulo",
            label: "Título da Cláusula",
            compare: (a, b) => a.title.localeCompare(b.title, "pt"),
          },
          {
            value: "categoria",
            label: "Categoria",
            compare: (a, b) => (a.category?.name || "").localeCompare(b.category?.name || "", "pt"),
          },
          {
            value: "versao",
            label: "Versão (Maior primeiro)",
            compare: (a, b) => (b.version || 1) - (a.version || 1),
          },
        ]}
        emptyTitle="Nenhuma cláusula encontrada"
        emptyDescription="Consulte ou selecione cláusulas nas propostas comerciais."
        emptyIcon="Layers"
      />

      {/* Drawer canónico de Consulta de Detalhes da Cláusula */}
      <Sheet open={Boolean(selectedClause)} onOpenChange={(val) => !val && setSelectedClause(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
          <SheetHeader className="p-6 border-b shrink-0 text-left">
            <SheetTitle className="text-lg font-bold">
              {selectedClause?.title || "Detalhes da Cláusula"}
            </SheetTitle>
            <SheetDescription>
              Categoria: {selectedClause?.category?.name || "Geral"} • Aplicação: {selectedClause?.applicableType || "GERAL"}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Enquadramento & Redação Jurídica Oficial
                </span>
                <Badge variant="outline" className="text-xs">
                  Legislação Angolana
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-foreground/90 font-mono whitespace-pre-wrap leading-relaxed">
                {selectedClause?.contentMarkdown}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground flex items-start gap-2.5">
              <Icon name="Info" size={16} className="text-primary shrink-0 mt-0.5" />
              <span>
                Esta cláusula está ativa no catálogo institucional da Mindware e é automaticamente vinculada à secção de Termos e Condições das propostas e contratos emitidos.
              </span>
            </div>
          </div>

          <SheetFooter className="p-4 border-t shrink-0 flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedClause(null)}
            >
              Fechar
            </Button>
            {selectedClause && (
              <Button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedClause.contentMarkdown);
                  toast.success("Texto da cláusula copiado com sucesso!");
                }}
                className="gap-1.5"
              >
                <Icon name="Copy" size={14} />
                <span>Copiar Texto</span>
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
