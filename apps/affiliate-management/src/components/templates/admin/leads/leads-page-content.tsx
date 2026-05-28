"use client";

import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button, TitleList } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { LeadList } from "@/components/admin/leads/lead-list";

export function LeadsPageContent() {
  const { openModal } = useModalStore();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TitleList
          title="Leads de Afiliados"
          suTitle="Acompanhe os potenciais clientes gerados pelos seus parceiros."
        />
        <Button className="flex items-center gap-2" onClick={() => openModal("create-lead")}>
          <Plus className="size-4" />
          Novo Lead
        </Button>
      </div>

      <Suspense fallback={<div>Carregando leads...</div>}>
        <LeadList />
      </Suspense>
    </div>
  );
}
