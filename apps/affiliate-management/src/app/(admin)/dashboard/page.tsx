import { DashboardPageContent, PageWrapper } from "@/components";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <PageWrapper subRoute="Dashboard">
      <Suspense fallback={<div>Carregando dashboard...</div>}>
        <DashboardPageContent />
      </Suspense>
    </PageWrapper>
  );
}
