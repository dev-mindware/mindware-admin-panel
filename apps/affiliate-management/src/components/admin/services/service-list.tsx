"use client";

import { useDeleteService, useServices, useUpdateService } from "@/hooks/affiliate";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  ButtonOnlyAction,
  Column,
  GenericTable,
  ListSkeleton,
  RequestError,
} from "@workspace/ui";
import { Service } from "@workspace/types/affiliate";
import { formatCurrency } from "@workspace/utils";
import { useModalStore } from "@workspace/hooks";
import { ServiceFormModal } from "./service-form-modal";
import { MobileCard } from "@/components/shared/mobile-card";

export function ServiceList() {
  const { data, isLoading, isError, refetch, page, total, totalPages, setPage, goToNextPage, goToPreviousPage } =
    useServices();
  const { openModal, open, modalData, closeModal } = useModalStore();
  const { mutate: updateService } = useUpdateService();
  const { mutate: deleteService } = useDeleteService();

  const buildActions = (item: Service) => [
    { label: "Editar", icon: "Pencil" as const, onClick: (current: Service) => openModal("edit-service", current) },
    {
      label: item.ativo ? "Desativar" : "Ativar",
      icon: item.ativo ? ("Ban" as const) : ("Check" as const),
      onClick: (current: Service) => updateService({ id: current.id, data: { ativo: !current.ativo } }),
    },
    {
      label: "Eliminar",
      icon: "Trash2" as const,
      variant: "destructive" as const,
      onClick: (current: Service) => openModal("delete-service", current),
    },
  ];

  const columns: Column<Service>[] = [
    {
      key: "nome",
      header: "Serviço",
      render: (_, item) => <div className="font-medium text-foreground">{item.nome}</div>,
    },
    {
      key: "preco",
      header: "Preço sugerido",
      render: (_, item) => <div className="text-sm">{formatCurrency(item.preco)}</div>,
    },
    {
      key: "comissao",
      header: "Comissão (%)",
      render: (_, item) => <div className="text-sm font-semibold text-primary">{item.comissao}%</div>,
    },
    {
      key: "ativo",
      header: "Estado",
      render: (_, item) => <Badge variant={item.ativo ? "default" : "secondary"}>{item.ativo ? "Ativo" : "Inativo"}</Badge>,
    },
    {
      key: "action",
      header: "Ações",
      render: (_, item) => <ButtonOnlyAction data={item} actions={buildActions(item)} />,
    },
  ];

  if (isLoading) return <ListSkeleton />;
  if (isError) return <RequestError refetch={refetch} message="Erro ao carregar serviços." />;

  const items = data || [];

  return (
    <div className="space-y-4">
      <div className="block space-y-3 sm:hidden">
        {items.length === 0 ? (
          <div className="rounded-2xl border bg-card px-4 py-8 text-center text-xs text-muted-foreground">
            Ainda não foram registados serviços no sistema.
          </div>
        ) : (
          items.map((item) => (
            <MobileCard
              key={item.id}
              title={item.nome}
              subtitle={formatCurrency(item.preco)}
              icon="Briefcase"
              badge={
                <Badge variant={item.ativo ? "default" : "secondary"}>
                  {item.ativo ? "Ativo" : "Inativo"}
                </Badge>
              }
              fields={[{ label: "Comissão", value: `${item.comissao}%` }]}
              footerAction={<ButtonOnlyAction data={item} actions={buildActions(item)} />}
            />
          ))
        )}
      </div>

      <div className="hidden sm:block">
        <GenericTable<Service>
          data={items}
          columns={columns}
          page={page}
          total={total}
          totalPages={totalPages}
          setPage={setPage}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          emptyTitle="Nenhum serviço encontrado"
          emptyDescription="Ainda não foram registados serviços no sistema."
          emptyIcon="Briefcase"
        />
      </div>

      <ServiceFormModal />

      <AlertDialog open={open["delete-service"]} onOpenChange={() => closeModal("delete-service")}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja eliminar o serviço <strong>{modalData["delete-service"]?.nome}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                deleteService(modalData["delete-service"]?.id);
                closeModal("delete-service");
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
