"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  Button,
  ButtonOnlyAction,
  FilterToolbar,
  GenericTable,
  Icon,
  ListSkeleton,
  PageWrapper,
  RequestError,
  TitleList,
  ToneBadge,
  type Column,
} from "@workspace/ui";
import { usersService } from "@/services/users-service";
import { DOCUMENT_TYPES } from "@/constants/document-types";
import type { AdminUser } from "@/types/user";
import { CreateUserModal } from "./create-user-modal";
import { ResetPasswordModal } from "./reset-password-modal";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  MANAGER: "Gestor",
  EDITOR: "Editor",
};

const ROLE_TONE = { ADMIN: "info", MANAGER: "warning", EDITOR: "neutral" } as const;

const docTypeLabel = (slug: string) => DOCUMENT_TYPES.find((d) => d.slug === slug)?.name ?? slug;

export function UserList() {
  const queryClient = useQueryClient();
  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(""),
    role: parseAsString.withDefault(""),
  });
  const [showCreate, setShowCreate] = useState(false);
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["users", params],
    queryFn: () =>
      usersService.list({
        page: params.page,
        limit: 20,
        search: params.search || undefined,
        role: params.role || undefined,
      }),
  });

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersService.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const columns: Column<AdminUser>[] = [
    { key: "name", header: "Nome" },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Papel",
      render: (v: AdminUser["role"]) => <ToneBadge label={ROLE_LABELS[v] ?? v} tone={ROLE_TONE[v] ?? "neutral"} />,
    },
    {
      key: "allowedDocumentTypes",
      header: "Tipos permitidos",
      render: (v: string[], u) =>
        u.role === "ADMIN"
          ? "Todos os tipos"
          : v.length === 0
            ? <ToneBadge label="Sem permissões" tone="danger" />
            : v.map(docTypeLabel).join(", "),
    },
    {
      key: "isActive",
      header: "Estado",
      render: (v: boolean) => <ToneBadge label={v ? "Activo" : "Inactivo"} tone={v ? "success" : "neutral"} />,
    },
    { key: "_count.documents", header: "Documentos", render: (v) => v ?? "—" },
    {
      key: "actions",
      header: "Acções",
      render: (_, u) => (
        <ButtonOnlyAction
          data={u}
          actions={[
            { label: "Redefinir senha", icon: "KeyRound", onClick: (x) => setResetTarget(x) },
            {
              label: u.isActive ? "Desactivar" : "Activar",
              icon: u.isActive ? "UserX" : "UserCheck",
              variant: u.isActive ? "destructive" : "default",
              onClick: (x) => toggle.mutate({ id: x.id, isActive: !x.isActive }),
            },
          ]}
        />
      ),
    },
  ];

  const meta = data?.meta;

  return (
    <PageWrapper routeLabel="Administração" subRoute="Utilizadores">
      <TitleList
        title="Gestão de Utilizadores"
        suTitle="Crie e gira utilizadores, defina papéis e controle os tipos de documentos que cada um pode criar"
      >
        <Button onClick={() => setShowCreate(true)}>
          <Icon name="CirclePlus" />
          Novo Utilizador
        </Button>
      </TitleList>

      <FilterToolbar
        search={{
          value: params.search,
          onChange: (v) => void setParams({ search: v || null, page: 1 }),
          placeholder: "Pesquisar por nome ou email…",
        }}
        filters={[
          {
            key: "role",
            label: "Papel",
            value: params.role,
            onChange: (v) => void setParams({ role: v || null, page: 1 }),
            options: Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
            placeholder: "Todos os papéis",
          },
        ]}
        onClear={() => void setParams({ search: null, role: null, page: 1 })}
      />

      {isError ? (
        <RequestError refetch={() => void refetch()} message="Não foi possível carregar os utilizadores." />
      ) : isLoading ? (
        <ListSkeleton cols={6} rows={5} />
      ) : (
        <GenericTable<AdminUser>
          data={data?.data ?? []}
          columns={columns}
          emptyTitle="Nenhum utilizador encontrado"
          emptyDescription="Ajuste a pesquisa ou crie um novo utilizador."
          emptyIcon="Users"
          page={params.page}
          total={meta?.total ?? 0}
          totalPages={meta?.totalPages ?? 1}
          setPage={(p) => void setParams({ page: p })}
          goToNextPage={() => void setParams({ page: Math.min(meta?.totalPages ?? 1, params.page + 1) })}
          goToPreviousPage={() => void setParams({ page: Math.max(1, params.page - 1) })}
        />
      )}

      <CreateUserModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
      />
      <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />
    </PageWrapper>
  );
}
