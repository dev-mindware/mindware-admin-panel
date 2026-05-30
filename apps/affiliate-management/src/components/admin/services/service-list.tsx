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

export function ServiceList() {
  const { data, isLoading, isError, refetch, page, total, totalPages, setPage, goToNextPage, goToPreviousPage } =
    useServices();
  const { openModal, open, modalData, closeModal } = useModalStore();
  const { mutate: updateService } = useUpdateService();
  const { mutate: deleteService } = useDeleteService();

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
      render: (_, item) => (
        <ButtonOnlyAction
          data={item}
          actions={[
            { label: "Editar", icon: "Pencil", onClick: (current) => openModal("edit-service", current) },
            {
              label: item.ativo ? "Desativar" : "Ativar",
              icon: item.ativo ? "Ban" : "Check",
              onClick: (current) => updateService({ id: current.id, data: { ativo: !current.ativo } }),
            },
            {
              label: "Eliminar",
              icon: "Trash2",
              variant: "destructive",
              onClick: (current) => openModal("delete-service", current),
            },
          ]}
        />
      ),
    },
  ];

  if (isLoading) return <ListSkeleton />;
  if (isError) return <RequestError refetch={refetch} message="Erro ao carregar serviços." />;

  return (
    <div className="space-y-4">
      <GenericTable<Service>
        data={data || []}
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
