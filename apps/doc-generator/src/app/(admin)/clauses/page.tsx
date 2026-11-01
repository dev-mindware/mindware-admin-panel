import { Suspense } from "react";
import { PageWrapper, ListSkeleton } from "@workspace/ui";
import { ClausesPageContent } from "@/components/clauses";

export default function ClausesPage() {
  return (
    <PageWrapper routeLabel="Cláusulas" subRoute="Biblioteca de Cláusulas">
      <Suspense fallback={<ListSkeleton cols={4} rows={5} />}>
        <ClausesPageContent />
      </Suspense>
    </PageWrapper>
  );
}
