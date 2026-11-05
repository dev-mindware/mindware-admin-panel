import { PageWrapper } from "@workspace/ui";
import { ClientsPageContent } from "@/components/clients";

export default function ClientsPage() {
  return (
    <PageWrapper routeLabel="Clientes" subRoute="Gestão de Clientes">
      <ClientsPageContent />
    </PageWrapper>
  );
}
