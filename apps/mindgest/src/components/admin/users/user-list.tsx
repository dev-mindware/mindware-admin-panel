"use client";

import { ButtonOnlyAction, GenericTable, ItemStatusBadge, ListSkeleton, RequestError, type Column } from "@/components";
import { useUserActions, useUserFilters, useUsers } from "@/hooks/users";
import type { User, UserRole } from "@/types";
import { formatDateTime } from "@/utils";
import { ResetPasswordModal } from "./reset-password-modal";
import { UserDetailsModal } from "./user-details-modal";
import { UserFilters } from "./user-filters";

const roleLabels: Record<UserRole, string> = {
  OWNER: "Proprietário",
  MANAGER: "Gestor",
  CASHIER: "Caixa",
};

export function UserList() {
  const { filters } = useUserFilters();
  const { openDetails, openResetPassword } = useUserActions();
  const pagination = useUsers(filters);

  const columns: Column<User>[] = [
    { key: "name", header: "Nome", render: (value) => <span className="font-medium">{value}</span> },
    { key: "email", header: "Email" },
    { key: "phone", header: "Telefone", render: (value) => value || "Não informado" },
    { key: "role", header: "Papel", render: (value: UserRole) => roleLabels[value] || value },
    { key: "status", header: "Estado", render: (value) => <ItemStatusBadge status={value} /> },
    { key: "terminalNumber", header: "Terminal", render: (value) => value || "Não informado" },
    { key: "barcode", header: "Código de barras", render: (value) => value || "Não informado" },
    { key: "createdAt", header: "Criado em", render: (value) => formatDateTime(value) },
    {
      key: "id",
      header: "Acções",
      render: (_, user) => (
        <ButtonOnlyAction
          data={user}
          actions={[
            { label: "Ver detalhes", icon: "Eye", onClick: openDetails },
            { type: "separator" },
            { label: "Resetar palavra-passe", icon: "KeyRound", onClick: openResetPassword },
          ]}
        />
      ),
    },
  ];

  if (pagination.isLoading) return <ListSkeleton />;
  if (pagination.isError) return <RequestError refetch={pagination.refetch} message="Erro ao carregar utilizadores" />;

  return (
    <div className="space-y-4">
      <UserFilters hasData={pagination.data.length > 0} />
      <GenericTable<User>
        data={pagination.data}
        columns={columns}
        page={pagination.page}
        total={pagination.total}
        totalPages={pagination.totalPages}
        setPage={pagination.setPage}
        goToNextPage={pagination.goToNextPage}
        goToPreviousPage={pagination.goToPreviousPage}
        emptyDescription="Nenhum utilizador encontrado com os filtros seleccionados."
        emptyIcon="Users"
      />
      <UserDetailsModal />
      <ResetPasswordModal />
    </div>
  );
}
