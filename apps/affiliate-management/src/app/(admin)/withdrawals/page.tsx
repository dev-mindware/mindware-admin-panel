import { PageWrapper } from "@workspace/ui";
import { WithdrawalList } from "@/components/admin/withdrawals/withdrawal-list";
import { Suspense } from "react";

export default function WithdrawalsPage() {
  return (
    <PageWrapper subRoute="Solicitações de Saque" routeLabel="Pagamentos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Pagamentos</h2>
            <p className="text-muted-foreground">
              Gerencie e processe as retiradas de fundos dos afiliados.
            </p>
          </div>
        </div>

        <Suspense fallback={<div>Carregando solicitações...</div>}>
          <WithdrawalList />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
