"use client";

import { Suspense } from "react";
import { TitleList } from "@workspace/ui";
import { SubscriptionList } from "@/components/admin/subscriptions/subscription-list";

export function SubscriptionsPageContent() {
  return (
    <div className="flex flex-col gap-6">
      <TitleList
        title="Subscrições"
        suTitle="Acompanhe as subscrições Mindgest, mude estados, registe pagamentos manuais e liberte comissões validadas."
      />
      <Suspense fallback={<div>A carregar subscrições...</div>}>
        <SubscriptionList />
      </Suspense>
    </div>
  );
}
