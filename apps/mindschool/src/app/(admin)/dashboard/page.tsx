import { PageWrapper } from "@workspace/ui";
import { DashboardPageContent } from "@/components/admin/dashboard/dashboard-page-content";

export default function DashboardPage() {
  return (
    <PageWrapper subRoute="Dashboard" routeLabel="Dashboard">
      <DashboardPageContent />
    </PageWrapper>
  );
}
