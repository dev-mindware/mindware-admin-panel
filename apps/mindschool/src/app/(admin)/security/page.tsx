import { PageWrapper } from "@workspace/ui";
import { SecurityPageContent } from "@/components/admin/security/security-page-content";

export default function SecurityPage() {
  return (
    <PageWrapper subRoute="Segurança" routeLabel="Segurança">
      <SecurityPageContent />
    </PageWrapper>
  );
}
