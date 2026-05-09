import { PageWrapper, DashboardContent } from "@/components";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <PageWrapper subRoute="Dashboard">
      <Suspense fallback={<div>Carregando dashboard...</div>}>
        <DashboardContent />
      </Suspense>
    </PageWrapper>
  );
}
