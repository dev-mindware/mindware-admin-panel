"use client";

import React, { useState } from "react";
import {
  TitleList,
  Button,
  Icon,
  Column,
  ButtonOnlyAction,
} from "@workspace/ui";
import { Client } from "@/services/clients-service";
import { useClientsList } from "@/hooks/clients";
import { ClientFormDrawer } from "./client-form-drawer";
import { DataList } from "@/components/common/data-list";
import { toast } from "sonner";

const uniq = (v: (string | null | undefined)[]) =>
  [...new Set(v.filter((x): x is string => Boolean(x)))].sort((a, b) =>
    a.localeCompare(b, "pt")
  );

export function ClientsPageContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Carrega a lista completa de clientes para alimentar a filtragem facetada canónica
  const { data: clientsResponse, isLoading, isError, refetch } = useClientsList({
    limit: 1000,
  });

  const clients = clientsResponse?.data || [];

  const columns: Column<Client>[] = [
    {
      key: "name",
      header: "Razão Social / Nome",
      render: (_, item) => (
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-foreground text-sm truncate">
            {item.name}
          </span>
          {item.tradeName && (
            <span className="text-xs text-muted-foreground truncate">
              {item.tradeName}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "nif",
      header: "NIF",
      render: (_, item) => (
        <span className="font-mono text-xs font-semibold text-primary px-2 py-0.5 rounded bg-primary/10 inline-block w-fit">
          {item.nif}
        </span>
      ),
    },
    {
      key: "city",
      header: "Localização",
      render: (_, item) => (
        <span className="text-muted-foreground text-xs truncate">
          {[item.city, item.country].filter(Boolean).join(", ") || "—"}
        </span>
      ),
    },
    {
      key: "email",
      header: "Correio Eletrónico",
      render: (_, item) => (
        <span className="text-muted-foreground text-xs truncate">
          {item.email || "—"}
        </span>
      ),
    },
    {
      key: "phone",
      header: "Telefone",
      render: (_, item) => (
        <span className="text-muted-foreground text-xs">
          {item.phone || "—"}
        </span>
      ),
    },
    {
      key: "action",
      header: "Ações",
      className: "text-right",
      render: (_, item) => (
        <div className="flex items-center justify-end">
          <ButtonOnlyAction
            data={item}
            actions={[
              {
                label: "Copiar NIF",
                onClick: (c: Client) => {
                  navigator.clipboard.writeText(c.nif);
                  toast.success("NIF copiado para a área de transferência!");
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
    <div className="space-y-6">
      <TitleList
        title="Clientes & Entidades"
        suTitle="Gestão de entidades empresariais, clientes finais e dados fiscais de faturação"
      >
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-2 cursor-pointer w-full sm:w-auto shadow-xs"
        >
          <Icon name="CirclePlus" size={16} />
          <span className="hidden sm:inline">Novo Cliente</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </TitleList>

      {/* Componente Canónico DataList: Filtros facetados desktop + Bottom Sheet Drawer no mobile com draft/apply */}
      <DataList<Client>
        prefix="clientes"
        rows={clients}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        pageSize={10}
        searchPlaceholder="Pesquisar por razão social, nome comercial, NIF, email ou cidade..."
        searchText={(c) =>
          `${c.name} ${c.tradeName || ""} ${c.nif} ${c.email || ""} ${c.city || ""} ${c.country || ""}`
        }
        filters={[
          {
            key: "cidade",
            label: "Cidade",
            icon: "MapPin",
            options: uniq(clients.map((c) => c.city)).map((v) => ({
              value: v,
              label: v,
            })),
            match: (c, v) => c.city === v,
          },
          {
            key: "pais",
            label: "País",
            icon: "Globe",
            options: uniq(clients.map((c) => c.country)).map((v) => ({
              value: v,
              label: v,
            })),
            match: (c, v) => c.country === v,
          },
        ]}
        sorts={[
          {
            value: "nome",
            label: "Nome / Razão Social",
            compare: (a, b) => a.name.localeCompare(b.name, "pt"),
          },
          {
            value: "nif",
            label: "NIF Fiscal",
            compare: (a, b) => a.nif.localeCompare(b.nif),
          },
          {
            value: "recente",
            label: "Mais recente",
            compare: (a, b) =>
              (b.createdAt || "").localeCompare(a.createdAt || ""),
          },
        ]}
        emptyTitle="Sem clientes registados"
        emptyDescription="Registe novos clientes para associar às suas propostas comerciais e documentos oficiais."
        emptyIcon="Users"
      />

      {/* Drawer canónico de criação de cliente */}
      <ClientFormDrawer
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}
