import { PageWrapper } from "@workspace/ui";
import { SubscriptionsPageContent } from "@/components/admin/subscriptions/subscriptions-page-content";

export default function SubscriptionsPage() {
  return (
    <PageWrapper subRoute="Subscrições" routeLabel="Subscrições">
      <SubscriptionsPageContent />
    </PageWrapper>
  );
}
