import { PageWrapper } from "@workspace/ui";
import { UsersPageContent } from "@/components/admin/users/users-page-content";

export default function UsersPage() {
  return (
    <PageWrapper subRoute="Utilizadores" routeLabel="Utilizadores">
      <UsersPageContent />
    </PageWrapper>
  );
}
