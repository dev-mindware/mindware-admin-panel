import { PageWrapper } from "@workspace/ui";
import { CommissionList } from "@/components/admin/commissions/commission-list";
import { Suspense } from "react";

export default function CommissionsPage() {
  return (
    <PageWrapper subRoute="Gestão de Comissões" routeLabel="Comissões">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Comissões</h2>
            <p className="text-muted-foreground">
              Gerencie os pagamentos devidos aos seus afiliados.
            </p>
          </div>
        </div>

        <Suspense fallback={<div>Carregando comissões...</div>}>
          <CommissionList />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
