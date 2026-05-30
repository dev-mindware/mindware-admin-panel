import { Suspense } from "react";
import { TitleList } from "@workspace/ui";
import { WithdrawalList } from "@/components/admin/withdrawals/withdrawal-list";

export function WithdrawalsPageContent() {
  return (
    <div className="flex flex-col gap-6">
      <TitleList
        title="Pagamentos"
        suTitle="Faça a gestão e processe os levantamentos dos afiliados."
      />
      <Suspense fallback={<div>A carregar solicitações...</div>}>
        <WithdrawalList />
      </Suspense>
    </div>
  );
}
