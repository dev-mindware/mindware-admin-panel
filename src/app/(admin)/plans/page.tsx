"use client";

import { PageWrapper } from "@/components";
import { PlansClient } from "@/components/admin/plans/plans-client";

export default function PlansPage() {
  return (
    <PageWrapper subRoute="Planos">
      <PlansClient />
    </PageWrapper>
  );
}
