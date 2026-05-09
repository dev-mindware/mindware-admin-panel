import { PageWrapper, DashboardContent } from "@/components";
import { SubscriptionList } from "@/components/admin/subscriptions";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <PageWrapper subRoute="Dashboard">
      <div className="space-y-12">
        <Suspense fallback={<div>Carregando estatísticas...</div>}>
          <DashboardContent />
        </Suspense>

        <Suspense fallback={<div>Carregando subscrições...</div>}>
          <SubscriptionList />
        </Suspense>
      </div>
    </PageWrapper>
  );
}

