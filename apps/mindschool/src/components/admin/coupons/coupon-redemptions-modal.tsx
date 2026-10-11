"use client";

import { Button, GlobalModal } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useCouponRedemptions } from "@/hooks/commerce/use-catalog";
import { dateTime, kz } from "@/utils/format";
import type { AdminCoupon } from "@/types/api";

export const COUPON_REDEMPTIONS_MODAL = "coupon-redemptions";

/** Histórico de utilizações de um cupão (escola, ordem, desconto). Abre com `openModal("coupon-redemptions", coupon)`. */
export function CouponRedemptionsModal() {
  const { open, modalData, closeModal } = useModalStore();
  const isOpen = !!open[COUPON_REDEMPTIONS_MODAL];
  const coupon = modalData[COUPON_REDEMPTIONS_MODAL] as AdminCoupon | undefined;
  const list = useCouponRedemptions(isOpen ? coupon?.id : undefined);

  if (!isOpen) return null;
  return (
    <GlobalModal
      id={COUPON_REDEMPTIONS_MODAL}
      size="md"
      title={`Utilizações de ${coupon?.code ?? ""}`}
      description={coupon ? `${coupon.uses_count} utilização(ões) confirmada(s)${coupon.max_total_uses ? ` de ${coupon.max_total_uses}` : ""}.` : undefined}
      footer={<div className="flex justify-end"><Button variant="outline" onClick={() => closeModal(COUPON_REDEMPTIONS_MODAL)}>Fechar</Button></div>}
    >
      {list.isLoading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">A carregar…</p>
      ) : list.all.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Ainda ninguém usou este cupão (conta quando a ordem é aprovada).</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {list.all.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 p-3 text-sm">
              <div>
                <p className="font-medium">{r.school.name ?? "Escola"}</p>
                <p className="text-xs text-muted-foreground">{dateTime(r.redeemed_at)}</p>
              </div>
              <span className="font-semibold text-green-600">− {kz(r.discount_amount)}</span>
            </li>
          ))}
        </ul>
      )}
      {list.hasMore && (
        <div className="pt-3 text-center">
          <Button size="sm" variant="outline" loading={list.isFetchingMore} onClick={list.goToNextPage}>
            Carregar mais
          </Button>
        </div>
      )}
    </GlobalModal>
  );
}
