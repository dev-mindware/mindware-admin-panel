import { PageWrapper } from "@workspace/ui";
import { CommunicationPageContent } from "@/components/admin/communication/communication-page-content";

export default function CommunicationPage() {
  return (
    <PageWrapper subRoute="Comunicação" routeLabel="Comunicação">
      <CommunicationPageContent />
    </PageWrapper>
  );
}
