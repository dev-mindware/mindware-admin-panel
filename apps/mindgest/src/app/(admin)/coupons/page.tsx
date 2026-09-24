"use client";

import { PageWrapper } from "@/components";
import { CouponsClient } from "@/components/admin/coupons/coupons-client";

export default function CouponsPage() {
  return (
    <PageWrapper subRoute="Cupões">
      <CouponsClient />
    </PageWrapper>
  );
}
