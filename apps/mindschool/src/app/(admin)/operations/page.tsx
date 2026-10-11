import { PageWrapper } from "@workspace/ui";
import { OperationsPageContent } from "@/components/admin/operations/operations-page-content";

export default function OperationsPage() {
  return (
    <PageWrapper subRoute="Operações" routeLabel="Operações">
      <OperationsPageContent />
    </PageWrapper>
  );
}
