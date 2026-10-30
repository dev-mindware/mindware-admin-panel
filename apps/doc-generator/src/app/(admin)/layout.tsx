import { AppSidebar, BreadcrumbProvider, SidebarInset } from "@/components";
import { PageWrapperHeaderActions } from "@workspace/ui";
import { NotificationBell } from "@/components/notifications/notification-bell";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <PageWrapperHeaderActions actions={<NotificationBell />}>
          <BreadcrumbProvider>{children}</BreadcrumbProvider>
        </PageWrapperHeaderActions>
      </SidebarInset>
    </>
  );
}