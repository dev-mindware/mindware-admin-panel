import { Suspense } from "react";
import { TitleList } from "@workspace/ui";
import { CommissionList } from "@/components/admin/commissions/commission-list";

export function CommissionsPageContent() {
  return (
    <div className="flex flex-col gap-6">
      <TitleList
        title="Comissões"
        suTitle="Faça a gestão dos pagamentos devidos aos seus afiliados."
      />
      <Suspense fallback={<div>A carregar comissões...</div>}>
        <CommissionList />
      </Suspense>
    </div>
  );
}
