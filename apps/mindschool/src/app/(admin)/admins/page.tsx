import { PageWrapper } from "@workspace/ui";
import { AdminsPageContent } from "@/components/admin/admins/admins-page-content";

export default function AdminsPage() {
  return (
    <PageWrapper subRoute="Administradores" routeLabel="Administradores">
      <AdminsPageContent />
    </PageWrapper>
  );
}
