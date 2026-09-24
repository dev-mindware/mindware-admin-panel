"use client";

import { useState } from "react";
import { Coupon, DiscountType } from "@/types/coupon";
import {
  GenericTable,
  Column,
  ListSkeleton,
  RequestError,
  ButtonOnlyAction,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Badge,
  Icon,
} from "@/components";
import {
  useAdminCoupons,
  useToggleCouponStatus,
  useDeleteCoupon,
} from "@/hooks/coupons/use-coupons";
import { useModal } from "@/stores/modal/use-modal-store";
import { CONFIRM_MODAL_ID } from "@/components/custom/confirm-modal";
import { formatCurrency, formatDateTime } from "@/utils";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

export function CouponList() {
  const [search, setSearch] = useState("");
  const [discountTypeFilter, setDiscountTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const { openModal } = useModal();
  const toggleMutation = useToggleCouponStatus();
  const deleteMutation = useDeleteCoupon();

  const queryParams = {
    search: search || undefined,
    discountType:
      discountTypeFilter !== "ALL" ? (discountTypeFilter as DiscountType) : undefined,
    isActive:
      statusFilter === "ACTIVE"
        ? true
        : statusFilter === "INACTIVE"
        ? false
        : undefined,
    page,
    limit: 10,
  };

  const { coupons, meta, isLoading, isError, refetch } =
    useAdminCoupons(queryParams);

  const handleEdit = (coupon: Coupon) => {
    openModal("manage-coupon", { coupon });
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      await toggleMutation.mutateAsync(coupon.id);
      SucessMessage(
        `Cupão ${coupon.isActive ? "desativado" : "ativado"} com sucesso!`
      );
    } catch (err: any) {
      ErrorMessage(
        err?.response?.data?.message || "Erro ao alterar status do cupão."
      );
    }
  };

  const handleDelete = (coupon: Coupon) => {
    openModal(CONFIRM_MODAL_ID, {
      title: "Eliminar Cupão",
      description: `Tem a certeza que deseja eliminar o cupão "${coupon.code}"? Se já tiver utilizações, será apenas inativado para manter o histórico.`,
      confirmLabel: "Eliminar",
      loadingLabel: "A eliminar...",
      destructive: true,
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(coupon.id);
          SucessMessage("Cupão removido com sucesso!");
        } catch (error: any) {
          ErrorMessage(
            error?.response?.data?.message || "Erro ao eliminar o cupão."
          );
          throw error;
        }
      },
    });
  };

  const columns: Column<Coupon>[] = [
    {
      key: "code",
      header: "Código",
      render: (_, item) => (
        <div>
          <span className="font-mono font-bold text-foreground tracking-wider bg-muted/50 px-2 py-0.5 rounded border">
            {item.code}
          </span>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
              {item.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "discount",
      header: "Desconto",
      render: (_, item) => (
        <div className="font-semibold text-foreground">
          {item.discountType === "PERCENTAGE"
            ? `${Number(item.discountValue)}%`
            : formatCurrency(Number(item.discountValue))}
          <span className="text-xs text-muted-foreground block font-normal">
            {item.discountType === "PERCENTAGE" ? "Percentual" : "Valor Fixo"}
          </span>
        </div>
      ),
    },
    {
      key: "uses",
      header: "Utilizações",
      render: (_, item) => {
        const current = item.currentUses || 0;

        return (
          <div>
            <span className="text-sm font-medium text-foreground">
              {current} {current === 1 ? "utilização" : "utilizações"}
            </span>
            <span className="text-xs text-muted-foreground block">
              Max {item.maxUsesPerCompany}/empresa
            </span>
          </div>
        );
      },
    },
    {
      key: "applicablePlan",
      header: "Plano Aplicável",
      render: (_, item) => (
        <span className="text-sm font-medium">
          {item.applicablePlan ? item.applicablePlan.name : "Todos os Planos"}
        </span>
      ),
    },
    {
      key: "validity",
      header: "Vigência",
      render: (_, item) => {
        if (!item.startsAt && !item.expiresAt) {
          return <span className="text-xs text-muted-foreground">Sempre válido</span>;
        }
        return (
          <div className="text-xs space-y-0.5">
            {item.startsAt && (
              <div>
                <span className="text-muted-foreground">De: </span>
                {formatDateTime(item.startsAt).split(" ")[0]}
              </div>
            )}
            {item.expiresAt && (
              <div>
                <span className="text-muted-foreground">Até: </span>
                {formatDateTime(item.expiresAt).split(" ")[0]}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (_, item) => {
        const now = new Date();
        const isExpired = item.expiresAt && new Date(item.expiresAt) < now;

        if (!item.isActive) {
          return <Badge variant="secondary">Inativo</Badge>;
        }
        if (isExpired) {
          return <Badge variant="destructive">Expirado</Badge>;
        }
        return <Badge variant="default" className="bg-emerald-600">Ativo</Badge>;
      },
    },
    {
      key: "action",
      header: "Ações",
      render: (_, item) => (
        <ButtonOnlyAction
          data={item}
          actions={[
            {
              label: "Editar Cupão",
              icon: "Pencil",
              onClick: () => handleEdit(item),
            },
            {
              label: item.isActive ? "Desativar Cupão" : "Ativar Cupão",
              icon: item.isActive ? "Power" : "CircleCheck",
              onClick: () => handleToggleStatus(item),
            },
            { type: "separator" },
            {
              label: "Eliminar",
              icon: "Trash2",
              onClick: () => handleDelete(item),
            },
          ]}
        />
      ),
    },
  ];

  if (isLoading && !coupons.length) return <ListSkeleton />;

  if (isError) {
    return (
      <RequestError
        refetch={refetch}
        message="Erro ao carregar lista de cupões."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Pesquisar por código ou descrição..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {/* Filtro Tipo */}
          <Select
            value={discountTypeFilter}
            onValueChange={(val) => {
              setDiscountTypeFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo de Desconto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os Tipos</SelectItem>
              <SelectItem value="PERCENTAGE">Percentual (%)</SelectItem>
              <SelectItem value="FIXED_AMOUNT">Valor Fixo (Kz)</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro Status */}
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os Status</SelectItem>
              <SelectItem value="ACTIVE">Ativos</SelectItem>
              <SelectItem value="INACTIVE">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabela de Dados */}
      <GenericTable<Coupon>
        data={coupons}
        columns={columns}
        page={meta.page}
        total={meta.total}
        totalPages={meta.totalPages}
        setPage={setPage}
        goToNextPage={() => setPage((prev) => Math.min(prev + 1, meta.totalPages))}
        goToPreviousPage={() => setPage((prev) => Math.max(prev - 1, 1))}
        emptyDescription="Nenhum cupão encontrado com os filtros selecionados."
      />
    </div>
  );
}
