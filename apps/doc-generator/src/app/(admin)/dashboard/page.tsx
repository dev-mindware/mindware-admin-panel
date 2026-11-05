import { PageWrapper } from "@workspace/ui";
import { DashboardPageContent } from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <PageWrapper subRoute="Dashboard">
      <DashboardPageContent />
    </PageWrapper>
  );
}
