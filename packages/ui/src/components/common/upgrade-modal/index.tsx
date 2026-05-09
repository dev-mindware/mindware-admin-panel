"use client";
import Link from "next/link";
import { useModalStore } from "@workspace/hooks";
import { Sparkles } from "lucide-react";
import { GlobalModal } from "../../modal";
import { Button } from "../../ui/button";

export const UPGRADE_PLAN_MODAL_ID = "upgrade-plan-modal";

export function UpgradePlanModal() {
  const { closeModal } = useModalStore();

  return (
    <GlobalModal
      id={UPGRADE_PLAN_MODAL_ID}
      title="Atualize seu Plano"
      description="Tenha acesso a recursos exclusivos e leve sua gestão para o próximo nível."
      className="sm:max-w-[500px]"
    >
      <div className="space-y-6">
        <div className="bg-primary/10 p-4 rounded-lg flex items-start gap-3">
          <div className="bg-primary/20 p-2 rounded-full">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Por que atualizar?</h4>
            <ul className="text-sm text-gray-600 mt-1 space-y-1 list-disc list-inside">
              <li>Relatórios financeiros avançados</li>
              <li>Gestão de múltiplos afiliados</li>
              <li>Automação de comissões</li>
              <li>Suporte prioritário</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild className="w-full h-11" onClick={() => closeModal(UPGRADE_PLAN_MODAL_ID)}>
            <Link href="/billing">Ver Planos e Preços</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => closeModal(UPGRADE_PLAN_MODAL_ID)}
          >
            Talvez mais tarde
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}
