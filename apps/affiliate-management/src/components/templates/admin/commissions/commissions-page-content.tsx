import { Suspense } from "react";
import { TitleList } from "@workspace/ui";
import { CommissionList } from "@/components/admin/commissions/commission-list";

export function CommissionsPageContent() {
  return (
    <div className="flex flex-col gap-6">
      <TitleList
        title="Comissoes"
        suTitle="Gerencie os pagamentos devidos aos seus afiliados."
      />
      <Suspense fallback={<div>Carregando comissoes...</div>}>
        <CommissionList />
      </Suspense>
    </div>
  );
}
