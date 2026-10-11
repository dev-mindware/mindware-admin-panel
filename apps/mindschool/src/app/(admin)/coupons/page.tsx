import { PageWrapper } from "@workspace/ui";
import { CouponsPageContent } from "@/components/admin/coupons/coupons-page-content";

export default function CouponsPage() {
  return (
    <PageWrapper subRoute="Cupões" routeLabel="Cupões">
      <CouponsPageContent />
    </PageWrapper>
  );
}
