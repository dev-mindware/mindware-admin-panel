"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PageWrapper,
  TitleList,
  GenericTable,
  DynamicDrawer,
  Button,
  Input,
  Badge,
  Icon,
  Card,
  Column,
  EmptyState,
  ButtonOnlyAction,
} from "@workspace/ui";
import { clientsService, Client, CreateClientDto } from "@/services/clients-service";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

export default function ClientsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: clientsResponse, isLoading } = useQuery({
    queryKey: ["clients", page, limit, search],
    queryFn: () =>
      clientsService.getClients({
        page,
        limit,
        search: search || undefined,
      }),
  });

  const clients = clientsResponse?.data || [];
  const total = clientsResponse?.total || 0;
  const totalPages = clientsResponse?.totalPages || 1;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClientDto>();

  const createMutation = useMutation({
    mutationFn: (data: CreateClientDto) => clientsService.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente registado com sucesso!");
      setIsCreateOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Erro ao registar cliente.");
    },
  });

  const columns: Column<Client>[] = [
    {
      key: "name",
      header: "Razão Social / Nome",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm">{item.name}</span>
          {item.tradeName && (
            <span className="text-xs text-muted-foreground">{item.tradeName}</span>
          )}
        </div>
      ),
    },
    {
      key: "nif",
      header: "NIF",
      render: (_, item) => (
        <span className="font-mono text-xs font-semibold text-primary px-2 py-0.5 rounded bg-primary/10">
          {item.nif}
        </span>
      ),
    },

    {
      key: "city",
      header: "Localização",
      render: (_, item) => (
        <span className="text-muted-foreground text-xs">
          {[item.city, item.country].filter(Boolean).join(", ") || "—"}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (_, item) => (
        <span className="text-muted-foreground text-xs">{item.email || "—"}</span>
      ),
    },
    {
      key: "phone",
      header: "Telefone",
      render: (_, item) => (
        <span className="text-muted-foreground text-xs">{item.phone || "—"}</span>
      ),
    },
    {
      key: "action",
      header: "Ação",
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
    <PageWrapper routeLabel="Clientes" subRoute="Gestão de Clientes">
      <TitleList
        title="Clientes & Entidades"
        suTitle="Gestão de entidades empresariais, clientes finais e dados fiscais de faturação"
      >
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 cursor-pointer">
          <Icon name="CirclePlus" size={16} />
          <span>Novo Cliente</span>
        </Button>
      </TitleList>

      {/* Search Input Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Input
            type="text"
            startIcon="Search"
            placeholder="Pesquisar por nome, NIF ou email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
          <span className="text-xs text-muted-foreground">
            A carregar clientes...
          </span>
        </Card>
      ) : clients.length > 0 ? (
        <GenericTable<Client>
          data={clients}
          columns={columns}
          total={total}
          totalPages={totalPages}
          page={page}
          setPage={(p: number) => setPage(p)}
          goToNextPage={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          goToPreviousPage={() => setPage((prev) => Math.max(1, prev - 1))}
          emptyTitle="Nenhum cliente encontrado"
          emptyDescription="Nenhum cliente coincide com a pesquisa."
        />
      ) : (
        <EmptyState
          title="Sem clientes cadastrados"
          description={
            search
              ? "Nenhum cliente coincide com a pesquisa."
              : "Cadastre novos clientes para associar às suas propostas comerciais."
          }
          icon="Users"
        />
      )}

      {/* Create Modal */}
      <DynamicDrawer
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        side="right"
        title="Novo Cliente / Entidade"
        description="Introduza os dados cadastrais da empresa ou cliente final"
      >
        <form
          onSubmit={handleSubmit((data) => createMutation.mutate(data))}
          className="space-y-4 pt-2"
        >
          <div className="space-y-2">
            <Input
              label="Razão Social / Nome Oficial *"
              placeholder="Ex: Sonangol E.P. ou João Silva"
              {...register("name", { required: "Nome obrigatório" })}
              error={errors.name?.message}
            />
          </div>

          <div className="space-y-2">
            <Input
              label="Nome Comercial (Opcional)"
              placeholder="Ex: Sonangol Distribuidora"
              {...register("tradeName")}
            />
          </div>

          <div className="space-y-2">
            <Input
              label="NIF / Identificação Fiscal *"
              placeholder="Ex: 5412345678"
              {...register("nif", { required: "NIF obrigatório" })}
              error={errors.nif?.message}
            />
          </div>

          <div className="space-y-2">
            <Input
              label="Endereço / Sede"
              placeholder="Ex: Rua Rainha Ginga, Edifício Kilamba"
              {...register("address")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Cidade" placeholder="Ex: Luanda" {...register("city")} />
            <Input label="País" placeholder="Ex: Angola" {...register("country")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Email de Contacto" type="email" placeholder="financeiro@empresa.ao" {...register("email")} />
            <Input label="Telefone" placeholder="+244 923 000 000" {...register("phone")} />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "A Registar..." : "Registar Cliente"}
            </Button>
          </div>
        </form>
      </DynamicDrawer>
    </PageWrapper>
  );
}
