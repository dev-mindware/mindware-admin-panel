"use client";

import { Suspense } from "react";
import { TitleList } from "@workspace/ui";
import { PartnerPlanList } from "@/components/admin/services/partner-plan-list";

export function PlansPageContent() {
  return (
    <div className="flex flex-col gap-6">
      <TitleList
        title="Planos Mindgest"
        suTitle="Planos do Mindgest Partners Program e respetivas percentagens de comissão (BASE, SMART, PRO)."
      />
      <Suspense fallback={<div>A carregar planos...</div>}>
        <PartnerPlanList />
      </Suspense>
    </div>
  );
}
