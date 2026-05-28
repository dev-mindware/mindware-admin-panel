import { Suspense } from "react";
import { TitleList } from "@workspace/ui";
import { WithdrawalList } from "@/components/admin/withdrawals/withdrawal-list";

export function WithdrawalsPageContent() {
  return (
    <div className="flex flex-col gap-6">
      <TitleList
        title="Pagamentos"
        suTitle="Gerencie e processe as retiradas de fundos dos afiliados."
      />
      <Suspense fallback={<div>Carregando solicitacoes...</div>}>
        <WithdrawalList />
      </Suspense>
    </div>
  );
}
