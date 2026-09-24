"use client";

import {
  Button,
  Icon,
  ConfirmModal,
} from "@/components";
import { CouponStats } from "./coupon-stats";
import { CouponList } from "./coupon-list";
import { CouponFormModal } from "./coupon-form-modal";
import { useCouponStats } from "@/hooks/coupons/use-coupons";
import { useModal } from "@/stores/modal/use-modal-store";

export function CouponsClient() {
  const { data: stats, isLoading: statsLoading } = useCouponStats();
  const { openModal } = useModal();

  const handleCreate = () => {
    openModal("manage-coupon");
  };

  return (
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Icon name="Ticket" className="w-6 h-6 text-primary" />
            Gestão de Cupões
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Crie, ative e gira cupões de desconto para campanhas promocionais e subscrições.
          </p>
        </div>

        <Button onClick={handleCreate} className="shadow-xs">
          <Icon name="Plus" className="w-4 h-4 mr-2" />
          Novo Cupão
        </Button>
      </div>

      {/* Estatísticas de Cupons */}
      <CouponStats stats={stats} isLoading={statsLoading} />

      {/* Lista e Tabela de Cupons */}
      <CouponList />

      {/* Modais */}
      <CouponFormModal />
      <ConfirmModal />
    </div>
  );
}
