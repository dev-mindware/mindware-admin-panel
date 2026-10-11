import { PageWrapper } from "@workspace/ui";
import { SchoolsPageContent } from "@/components/admin/schools/schools-page-content";

export default function SchoolsPage() {
  return (
    <PageWrapper subRoute="Escolas" routeLabel="Escolas">
      <SchoolsPageContent />
    </PageWrapper>
  );
}
