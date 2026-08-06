"use client";

import { Suspense } from "react";
import { TitleList } from "@workspace/ui";
import { LeadList } from "@/components/admin/leads/lead-list";

export function LeadsPageContent() {
  return (
    <div className="flex flex-col gap-6">
      <TitleList
        title="Leads de Afiliados"
        suTitle="Acompanhe os potenciais clientes gerados pelos seus parceiros."
      />

      <Suspense fallback={<div>A carregar leads...</div>}>
        <LeadList />
      </Suspense>
    </div>
  );
}
