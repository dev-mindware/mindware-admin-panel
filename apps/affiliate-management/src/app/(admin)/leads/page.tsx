"use client";

import { PageWrapper, Button } from "@workspace/ui";
import { LeadList } from "@/components/admin/leads/lead-list";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { useModalStore } from "@workspace/hooks";

export default function LeadsPage() {
  const { openModal } = useModalStore();

  return (
    <PageWrapper subRoute="Gestão de Leads" routeLabel="Leads">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Leads de Afiliados</h2>
            <p className="text-muted-foreground">
              Acompanhe os potenciais clientes gerados pelos seus parceiros.
            </p>
          </div>
          <Button 
            className="flex items-center gap-2"
            onClick={() => openModal("create-lead")}
          >
            <Plus className="size-4" />
            Novo Lead
          </Button>
        </div>

        <Suspense fallback={<div>Carregando leads...</div>}>
          <LeadList />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
