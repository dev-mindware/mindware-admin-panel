import { PageWrapper } from "@workspace/ui";
import { ImpersonationsPageContent } from "@/components/admin/impersonations/impersonations-page-content";

export default function ImpersonationsPage() {
  return (
    <PageWrapper subRoute="Personificações" routeLabel="Personificações">
      <ImpersonationsPageContent />
    </PageWrapper>
  );
}
