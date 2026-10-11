import { PageWrapper } from "@workspace/ui";
import { PlansPageContent } from "@/components/admin/plans/plans-page-content";

export default function PlansPage() {
  return (
    <PageWrapper subRoute="Planos e extras" routeLabel="Planos e extras">
      <PlansPageContent />
    </PageWrapper>
  );
}
