"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Icon } from "@workspace/ui";
import { documentsService, DocumentItem } from "@/services/documents-service";
import { GenerationStatusBadge } from "@/components/documents/GenerationStatusBadge";
import { DocumentPreviewDrawer } from "@/components/documents/DocumentPreviewDrawer";
import { DocumentTypeConfig } from "@/constants/document-types";
import { toast } from "sonner";

interface DocumentCategoryViewProps {
  typeConfig: DocumentTypeConfig;
}

export function DocumentCategoryView({ typeConfig }: DocumentCategoryViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ler parâmetros da URL (Padrão Mindgest)
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const searchParam = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "ALL";

  const [searchValue, setSearchValue] = useState(searchParam);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    setSearchValue(searchParam);
  }, [searchParam]);

  // Atualizar URL sem scroll e sem piscar
  const updateParams = useCallback(
    (updates: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      if ("page" in updates) {
        if (updates.page && updates.page > 1) {
          params.set("page", String(updates.page));
        } else {
          params.delete("page");
        }
      }

      if ("limit" in updates) {
        if (updates.limit && updates.limit !== 10) {
          params.set("limit", String(updates.limit));
        } else {
          params.delete("limit");
        }
      }

      if ("search" in updates) {
        if (updates.search && updates.search.trim()) {
          params.set("search", updates.search.trim());
        } else {
          params.delete("search");
        }
        params.delete("page");
      }

      if ("status" in updates) {
        if (updates.status && updates.status !== "ALL") {
          params.set("status", updates.status);
        } else {
          params.delete("status");
        }
        params.delete("page");
      }

      const qs = params.toString();
      router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue !== searchParam) {
        updateParams({ search: searchValue });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue, searchParam, updateParams]);

  const {
    data: documentsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["documents", typeConfig.slug, page, limit, statusFilter, searchParam],
    queryFn: () =>
      documentsService.getDocuments({
        page,
        limit,
        type: typeConfig.slug,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: searchParam.trim() || undefined,
      }),
    placeholderData: (previousData) => previousData,
  });

  const documents = documentsResponse?.data || [];
  const total = documentsResponse?.total ?? documentsResponse?.meta?.total ?? 0;
  const totalPages = documentsResponse?.totalPages ?? documentsResponse?.meta?.totalPages ?? 1;

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
          className="font-mono text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 cursor-pointer"
        >
          <Icon name="FileText" size={13} />
          <span>{item.code}</span>
        </button>
      ),
    },
    {
      key: "title",
      header: "Título & Objecto",
      render: (_, item) => (
        <div className="flex flex-col max-w-sm">
          <span className="font-medium text-xs text-foreground truncate">
            {item.title}
          </span>
          {item.client?.name && (
            <span className="text-[11px] text-muted-foreground truncate">
              Cliente: {item.client.name}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => (
        <GenerationStatusBadge status={item.status} />
      ),
    },
    {
      key: "priceItems",
      header: "Valor Global",
      render: (_, item) => {
        const totalAmount = (item.priceItems || []).reduce(
          (sum, p) => sum + Number(p.valueKz || 0),
          0
        );
        return (
          <span className="font-semibold text-xs text-foreground">
            {formatKwanza(totalAmount)}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Criado em",
      render: (_, item) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(item.createdAt).toLocaleDateString("pt-AO", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Acções",
      className: "text-right",
      render: (_, item) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs px-2 gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => handleOpenPreview(item)}
            title="Pré-visualizar & Editar"
          >
            <Icon name="Eye" size={13} />
            <span>Ver</span>
          </Button>

          {item.status === "GENERATED" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2 gap-1 cursor-pointer"
              onClick={() => {
                const url = documentsService.getDirectPdfUrl(item.id);
                window.open(url, "_blank");
              }}
              title="Abrir PDF oficial em nova aba"
            >
              <Icon name="FileDown" size={13} />
              <span>PDF</span>
            </Button>
          )}

          <ButtonOnlyAction
            data={item}
            actions={[
              {
                label: "Pré-visualizar & Editar",
                onClick: () => handleOpenPreview(item),
                icon: "Eye",
              },
              {
                label: "Abrir PDF em nova aba",
                onClick: () => {
                  const url = documentsService.getDirectPdfUrl(item.id);
                  window.open(url, "_blank");
                },
                icon: "FileDown",
              },
              {
                label: "Baixar PDF (Download Direto)",
                onClick: () => {
                  const url = documentsService.getDownloadPdfUrl(item.id);
                  window.open(url, "_blank");
                },
                icon: "Download",
              },
              {
                label: "Duplicar como Rascunho",
                onClick: async () => {
                  try {
                    await documentsService.createDocument({
                      code: `${item.code}-COPY`,
                      title: `${item.title} (Cópia)`,
                      clientId: item.clientId,
                      templateId: item.templateId,
                      notes: item.notes || undefined,
                      priceItems: item.priceItems,
                    });
                    toast.success("Documento duplicado com sucesso!");
                    refetch();
                  } catch (err: any) {
                    toast.error("Erro ao duplicar documento: " + err.message);
                  }
                },
                icon: "Copy",
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      routeLabel="Documentos"
      subRoute={typeConfig.pluralName}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TitleList
            title={typeConfig.pluralName}
            suTitle={`Gestão, emissão e exportação PDF de ${typeConfig.pluralName.toLowerCase()} institucionais da Mindware`}
          />

          <Link href={`/documents/${typeConfig.slug}/add`}>
            <Button className="gap-2 cursor-pointer shadow-sm">
              <Icon name="Plus" size={15} />
              <span>Criar Novo(a) {typeConfig.name}</span>
            </Button>
          </Link>
        </div>

        {/* Barra de Filtros e Busca com URL Query Params */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Input
              type="text"
              startIcon="Search"
              placeholder={`Pesquisar por código, título ou cliente...`}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <div className="flex items-center bg-sidebar rounded-lg p-1 border border-border/80">
              {[
                { id: "ALL", label: "Todos" },
                { id: "GENERATED", label: "Gerados" },
                { id: "DRAFT", label: "Rascunhos" },
                { id: "FAILED", label: "Falhados" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => updateParams({ status: tab.id })}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? "bg-primary-50 dark:bg-primary/10 text-primary-700 dark:text-primary-400 font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {(searchParam || statusFilter !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateParams({ search: "", status: "ALL" })}
                className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Tabela de Listagem de Documentos com Transição Suave (Anti-Flicker) */}
        {isLoading && !documentsResponse ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
            <span className="text-xs text-muted-foreground">
              A carregar {typeConfig.pluralName.toLowerCase()}...
            </span>
          </Card>
        ) : documents.length > 0 ? (
          <GenericTable<DocumentItem>
            data={documents}
            columns={columns}
            total={total}
            totalPages={totalPages}
            page={page}
            setPage={(p: number) => updateParams({ page: p })}
            goToNextPage={() => updateParams({ page: Math.min(totalPages, page + 1) })}
            goToPreviousPage={() => updateParams({ page: Math.max(1, page - 1) })}
            emptyTitle={`Nenhum(a) ${typeConfig.singularName.toLowerCase()} encontrado(a)`}
            emptyDescription="Nenhum documento coincide com os filtros aplicados."
          />
        ) : (
          <EmptyState
            title={`Sem ${typeConfig.pluralName.toLowerCase()} registados`}
            description={
              searchParam || statusFilter !== "ALL"
                ? "Nenhum documento coincide com os filtros aplicados."
                : `Ainda não existem registos nesta categoria. Clique no botão acima para criar.`
            }
            icon={typeConfig.icon}
          />
        )}

        {/* Drawer de Pré-visualização e Edição Completa */}
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
