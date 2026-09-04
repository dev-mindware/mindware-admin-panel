"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  PageWrapper,
  TitleList,
  GenericTable,
  Column,
  ButtonOnlyAction,
  EmptyState,
} from "@workspace/ui";
import {
  Button,
  Input,
  Card,
  Badge,
} from "@workspace/ui";
import { DynamicMetricCard } from "@workspace/ui";
import { Icon } from "@workspace/ui";
import { documentsService, DocumentItem } from "@/services/documents-service";
import { GenerationStatusBadge } from "@/components/documents/GenerationStatusBadge";
import { DocumentPreviewDrawer } from "@/components/documents/DocumentPreviewDrawer";
import { toast } from "sonner";

export default function DashboardPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const {
    data: documentsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["documents", "dashboard", page, limit, search],
    queryFn: () =>
      documentsService.getDocuments({
        page,
        limit,
        search: search.trim() || undefined,
      }),
  });

  const documents = documentsResponse?.data || [];
  const total = documentsResponse?.total ?? documentsResponse?.meta?.total ?? 0;
  const totalPages = documentsResponse?.totalPages ?? documentsResponse?.meta?.totalPages ?? 1;

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
      render: (_, item) => (
        <button
          onClick={() => handleOpenPreview(item)}
          className="font-mono font-medium text-foreground hover:text-primary hover:underline cursor-pointer text-left"
        >
          {item.code}
        </button>
      ),
    },
    {
      key: "title",
      header: "Título & Tipo",
      render: (_, item) => (
        <div>
          <button
            onClick={() => handleOpenPreview(item)}
            className="font-medium text-foreground text-sm leading-tight hover:text-primary hover:underline cursor-pointer text-left block"
          >
            {item.title}
          </button>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-muted-foreground">
              {item.template?.name || "Documento Oficial"}
            </span>
            <Badge variant="outline" className="text-[9px] h-4 py-0 px-1.5">
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
        <div>
          <p className="font-medium text-foreground">
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
          <span className="font-mono font-medium text-primary text-sm">
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
      header: "Acção",
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
            <span>Preview</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              window.open(documentsService.getDirectPdfUrl(item.id), "_blank")
            }
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
                onClick: (doc) => {
                  window.open(documentsService.getDirectPdfUrl(doc.id), "_blank");
                },
                icon: "Download",
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <PageWrapper subRoute="Dashboard">
      <div className="space-y-6">
        {/* TitleList with Add Button embedded directly in the page */}
        <TitleList
          title="Dashboard Geral"
          suTitle="Visão consolidada de métricas, desempenho e documentos emitidos"
        >
          <Link href="/documents/proposal/add">
            <Button className="gap-2 shadow-xs cursor-pointer">
              <Icon name="CirclePlus" size={16} />
              <span>Nova Proposta</span>
            </Button>
          </Link>
        </TitleList>

        {/* Dynamic Metric Cards: 4 columns on desktop (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Input
              type="text"
              startIcon="Search"
              placeholder="Pesquisar por código, título ou cliente..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Documents Table */}
        {isLoading ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
            <span className="text-xs text-muted-foreground">
              A carregar propostas e documentos do servidor...
            </span>
          </Card>
        ) : documents.length > 0 ? (
          <GenericTable<DocumentItem>
            data={documents}
            columns={columns}
            total={total}
            totalPages={totalPages}
            page={page}
            setPage={(p: number) => setPage(p)}
            goToNextPage={() => setPage((prev: number) => Math.min(totalPages, prev + 1))}
            goToPreviousPage={() => setPage((prev: number) => Math.max(1, prev - 1))}
            emptyTitle="Nenhum documento encontrado"
            emptyDescription="Ainda não existem documentos cadastrados no sistema."
          />
        ) : (
          <EmptyState
            title="Nenhum documento encontrado"
            description={
              search
                ? "Nenhum documento coincide com os termos da pesquisa."
                : "Ainda não existem documentos cadastrados no sistema."
            }
            icon="FolderOpen"
          />
        )}

        {/* Document Preview & Full Editing Drawer */}
        <DocumentPreviewDrawer
          document={selectedDoc}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onUpdated={() => refetch()}
        />
      </div>
    </PageWrapper>
  );
}
