import { PageWrapper } from "@workspace/ui";
import { AffiliateList } from "@/components/admin/affiliates/affiliate-list";
import { Suspense } from "react";

export default function AffiliatesPage() {
  return (
    <PageWrapper subRoute="Gestão de Afiliados" routeLabel="Afiliados">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Afiliados</h2>
            <p className="text-muted-foreground">
              Gerencie seus parceiros, aprove cadastros e monitore performance.
            </p>
          </div>
        </div>

        <Suspense fallback={<div>Carregando afiliados...</div>}>
          <AffiliateList />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
