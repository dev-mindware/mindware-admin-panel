import { Suspense } from "react";
import { PageWrapper } from "@workspace/ui";
import { SettingsPageContent } from "@/components/admin/settings/settings-page-content";

export default function SettingsPage() {
  return (
    <PageWrapper subRoute="Definições" routeLabel="Definições">
      <Suspense>
        <SettingsPageContent />
      </Suspense>
    </PageWrapper>
  );
}
