import { SectionCards, PageWrapper } from "@/components";
import { SubscriptionList } from "@/components/admin/subscriptions";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <PageWrapper subRoute="Dashboard">
      <div className="space-y-8">
        <SectionCards />

        <Suspense fallback={<div>Carregando subscrições...</div>}>
          <SubscriptionList />
        </Suspense>
      </div>
    </PageWrapper>
  );
}

