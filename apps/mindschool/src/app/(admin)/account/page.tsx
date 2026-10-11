import { PageWrapper } from "@workspace/ui";
import { AccountPageContent } from "@/components/admin/account/account-page-content";

export default function AccountPage() {
  return (
    <PageWrapper subRoute="A minha conta" routeLabel="A minha conta">
      <AccountPageContent />
    </PageWrapper>
  );
}
