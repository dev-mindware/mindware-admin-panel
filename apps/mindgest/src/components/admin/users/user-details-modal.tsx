"use client";

import { Button, DetailRow, GlobalModal, Icon, ItemStatusBadge } from "@/components";
import { useModal } from "@/stores";
import type { User, UserRole } from "@/types";
import { formatDateTime } from "@/utils";

const roleLabels: Record<UserRole, string> = {
  OWNER: "Proprietário",
  MANAGER: "Gestor",
  CASHIER: "Caixa",
};

export function UserDetailsModal() {
  const { modalData, closeModal } = useModal();
  const user = modalData["view-user-details"] as User | undefined;

  if (!user) return null;

  const handleClose = () => closeModal("view-user-details");

  return (
    <GlobalModal
      id="view-user-details"
      title="Detalhes do utilizador"
      className="max-h-[80vh] overflow-y-auto !w-max !max-w-[80vw]"
      footer={
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="w-[920px] max-w-[90vw] space-y-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border bg-muted">
              <Icon name="User" className="size-8 text-muted-foreground" />
            </div>

            <div className="min-w-0 space-y-1">
              <h3 className="text-xl font-bold">{user.name}</h3>

              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <Icon name="Fingerprint" className="size-3 shrink-0" />
                <span className="break-all">{user.id}</span>
              </p>
            </div>
          </div>

          <ItemStatusBadge status={user.status} />
        </div>

        {user.warning && (
          <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <Icon name="TriangleAlert" className="mt-0.5 size-4 shrink-0" />
            <span>{user.warning}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="min-w-0 space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-primary">
              <Icon name="Contact" className="size-4" />
              Contacto e acesso
            </h4>

            <div className="min-w-0 space-y-2 rounded-xl border bg-muted/20 p-4">
              <DetailRow label="ID do utilizador" value={user.id} />
              <DetailRow label="Email" value={user.email} />
              <DetailRow label="Telefone" value={user.phone || "N/A"} />
              <DetailRow label="Papel" value={roleLabels[user.role]} />
              <DetailRow label="Estado" value={user.status} />
              <DetailRow label="Número do terminal" value={user.terminalNumber || "N/A"} />
              <DetailRow label="Código de barras" value={user.barcode || "N/A"} />
            </div>
          </section>

          <section className="min-w-0 space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-primary">
              <Icon name="Building" className="size-4" />
              Empresa e datas
            </h4>

            <div className="min-w-0 space-y-2 rounded-xl border bg-muted/20 p-4">
              <DetailRow label="ID da empresa" value={user.companyId || "N/A"} />
              <DetailRow label="ID da loja principal" value={user.storeId || "N/A"} />
              <DetailRow label="Criado em" value={formatDateTime(user.createdAt)} />
              <DetailRow label="Actualizado em" value={formatDateTime(user.updatedAt)} />
            </div>
          </section>
        </div>

        <section className="min-w-0 space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-primary">
            <Icon name="Store" className="size-4" />
            Lojas atribuídas ({user.stores?.length || user.storeIds?.length || 0})
          </h4>

          {user.stores?.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {user.stores.map((store) => (
                <div key={store.id} className="min-w-0 space-y-1 rounded-lg border bg-muted/10 p-3">
                  <p className="truncate font-medium">{store.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {store.email || "Sem email"}
                  </p>
                  <p className="break-all text-xs text-muted-foreground">
                    ID: {store.id}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border bg-muted/10 p-4 text-sm text-muted-foreground">
              {user.storeIds?.length
                ? user.storeIds.join(", ")
                : user.storeId || "Nenhuma loja atribuída."}
            </p>
          )}
        </section>
      </div>
    </GlobalModal>
  );
}
