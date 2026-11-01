"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TitleList,
  Column,
  ButtonOnlyAction,
  Button,
  Badge,
  DynamicMetricCard,
  Icon,
} from "@workspace/ui";
import { downloadDocumentPdf } from "@/lib/pdf-actions";
import { DocumentItem } from "@/services/documents-service";
import { useDocumentsList } from "@/hooks/documents";
import { GenerationStatusBadge } from "@/components/documents/GenerationStatusBadge";
import { DocumentPreviewDrawer } from "@/components/documents/DocumentPreviewDrawer";
import { DataList } from "@/components/common/data-list";

const uniq = (v: (string | null | undefined)[]) =>
  [...new Set(v.filter((x): x is string => Boolean(x)))].sort((a, b) =>
    a.localeCompare(b, "pt")
  );

export function DashboardPageContent() {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Carrega documentos para alimentar as métricas globais e a DataList facetada
  const { data: documentsResponse, isLoading, isError, refetch } = useDocumentsList({
    limit: 1000,
  });

  const documents = documentsResponse?.data || [];

  const totalValue = documents.reduce((acc, doc) => {
    const docSum = (doc.priceItems || []).reduce(
      (s, it) => s + Number(it.valueKz || 0),
      0
    );
    return acc + docSum;
  }, 0);

  const generatedCount = documents.filter(
    (d) => d.status === "GENERATED"
  ).length;

  const handleOpenPreview = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setIsPreviewOpen(true);
  };

  const formatKwanza = (value: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
    })
      .format(value)
      .replace("AOA", "Kz");
  };

  const columns: Column<DocumentItem>[] = [
    {
      key: "code",
      header: "Código",
      className: "w-32",
      render: (_, item) => (
        <button
          onClick={() => handleOpenPreview(item)}
          className="font-mono text-xs font-semibold text-foreground hover:text-primary hover:underline cursor-pointer text-left inline-block"
        >
          {item.code}
        </button>
      ),
    },
    {
      key: "title",
      header: "Título & Tipo",
      render: (_, item) => (
        <div className="min-w-0">
          <button
            onClick={() => handleOpenPreview(item)}
            className="font-medium text-foreground text-sm leading-tight hover:text-primary hover:underline cursor-pointer text-left block truncate"
          >
            {item.title}
          </button>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-muted-foreground truncate">
              {item.template?.name || "Documento Oficial"}
            </span>
            <Badge variant="outline" className="text-xs h-4 py-0 px-1.5 shrink-0">
              Oficial
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: "client.name",
      header: "Cliente / Entidade",
      render: (_, item) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground text-sm truncate">
            {item.client?.name || "Consumidor Final"}
          </p>
          <span className="text-xs text-muted-foreground font-mono">
            {item.client?.nif ? `NIF: ${item.client.nif}` : "Sem NIF"}
          </span>
        </div>
      ),
    },
    {
      key: "total",
      header: "Valor (Kz)",
      className: "text-right",
      render: (_, item) => {
        const docTotal = (item.priceItems || []).reduce(
          (acc, it) => acc + Number(it.valueKz || 0),
          0
        );
        return (
          <span className="font-mono font-medium text-primary text-sm tabular-nums whitespace-nowrap">
            {formatKwanza(docTotal)}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Estado",
      className: "text-center",
      render: (_, item) => <GenerationStatusBadge status={item.status} />,
    },
    {
      key: "action",
      header: "Ações",
      className: "text-right",
      render: (_, item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenPreview(item)}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <Icon name="Eye" size={14} className="text-muted-foreground" />
            <span className="hidden sm:inline">Visualizar</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => downloadDocumentPdf(item.id, `${item.code}.pdf`)}
            className="h-8 text-xs gap-1.5 text-primary bg-primary/10 hover:bg-primary/20 cursor-pointer"
            title="Descarregar PDF em tempo real"
          >
            <Icon name="Download" size={14} />
          </Button>

          <ButtonOnlyAction
            data={item}
            actions={[
              {
                label: "Visualizar e Gerar",
                onClick: handleOpenPreview,
                icon: "Eye",
              },
              {
                label: "Descarregar PDF",
                onClick: (doc) => downloadDocumentPdf(doc.id, `${doc.code}.pdf`),
                icon: "Download",
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <TitleList
        title="Dashboard Geral"
        suTitle="Visão consolidada de métricas, desempenho e documentos emitidos"
      >
        <Link href="/documents/proposal/add" className="w-full sm:w-auto">
          <Button className="gap-2 shadow-xs cursor-pointer w-full sm:w-auto">
            <Icon name="CirclePlus" size={16} />
            <span className="hidden sm:inline">Nova Proposta</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </Link>
      </TitleList>

      {/* Grelha de Métricas Canónica MindSchool/Mindgest: 2 colunas mobile -> 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <DynamicMetricCard
          title={documents.length.toString()}
          subtitle="Documentos Emitidos"
          description="Total consolidado de propostas e contratos"
          icon="ScrollText"
        />

        <DynamicMetricCard
          title={generatedCount.toString()}
          subtitle="PDFs Concluídos"
          description="Renderização dinâmica em tempo real"
          icon="CircleCheck"
        />

        <DynamicMetricCard
          title={new Set(documents.map((d) => d.clientId)).size.toString()}
          subtitle="Clientes Atendidos"
          description="Entidades e empresas no ecossistema"
          icon="Users"
        />

        <DynamicMetricCard
          title={formatKwanza(totalValue)}
          subtitle="Volume Financeiro"
          description="Desempenho financeiro global acumulado"
          icon="DollarSign"
        />
      </div>

      {/* Tabela Canónica DataList com Filtros Facetados Desktop + Bottom Sheet Drawer Mobile */}
      <DataList<DocumentItem>
        prefix="dashboard-docs"
        rows={documents}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        pageSize={10}
        searchPlaceholder="Pesquisar por código, título, cliente ou NIF..."
        searchText={(doc) =>
          `${doc.code} ${doc.title} ${doc.client?.name || ""} ${doc.client?.nif || ""} ${doc.template?.name || ""}`
        }
        filters={[
          {
            key: "estado",
            label: "Estado",
            icon: "Flag",
            options: [
              { value: "DRAFT", label: "Rascunho" },
              { value: "GENERATED", label: "Concluído" },
              { value: "APPROVED", label: "Aprovado" },
              { value: "REJECTED", label: "Rejeitado" },
            ],
            match: (doc, v) => doc.status === v,
          },
          {
            key: "tipo",
            label: "Tipo",
            icon: "FileText",
            options: uniq(documents.map((d) => d.template?.name || d.type)).map(
              (v) => ({ value: v, label: v })
            ),
            match: (doc, v) => (doc.template?.name || doc.type) === v,
          },
          {
            key: "cliente",
            label: "Cliente",
            icon: "Building",
            options: uniq(documents.map((d) => d.client?.name)).map((v) => ({
              value: v,
              label: v,
            })),
            match: (doc, v) => doc.client?.name === v,
          },
        ]}
        dateFilters={[
          {
            key: "emissao",
            label: "Data de Criação",
            getDate: (doc) => doc.createdAt,
          },
        ]}
        sorts={[
          {
            value: "data",
            label: "Mais recente",
            compare: (a, b) => b.createdAt.localeCompare(a.createdAt),
          },
          {
            value: "codigo",
            label: "Código oficial",
            compare: (a, b) => a.code.localeCompare(b.code),
          },
          {
            value: "titulo",
            label: "Título",
            compare: (a, b) => a.title.localeCompare(b.title, "pt"),
          },
        ]}
        emptyTitle="Nenhum documento emitido"
        emptyDescription="Comece por emitir a sua primeira proposta comercial ou contrato oficial."
        emptyIcon="ScrollText"
      />

      {/* Drawer de Pré-visualização do Documento */}
      <DocumentPreviewDrawer
        document={selectedDoc}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedDoc(null);
        }}
        onUpdated={() => {
          refetch();
        }}
      />
    </div>
  );
}
