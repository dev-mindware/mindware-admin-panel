import { Suspense } from "react";
import { TitleList } from "@workspace/ui";
import { AffiliateList } from "@/components/admin/affiliates/affiliate-list";

export function AffiliatesPageContent() {
  return (
    <div className="flex flex-col gap-6">
      <TitleList
        title="Afiliados"
        suTitle="Gerencie parceiros, aprove cadastros e monitore performance."
      />
      <Suspense fallback={<div>Carregando afiliados...</div>}>
        <AffiliateList />
      </Suspense>
    </div>
  );
}
