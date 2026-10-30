import { AppSidebar, BreadcrumbProvider, SidebarInset } from "@/components";
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
        {/* Fica sobre a zona vazia do cabeçalho sticky (z-50) das páginas. */}
        <div className="fixed right-4 top-3 z-[60]">
          <NotificationBell />
        </div>
        <BreadcrumbProvider>{children}</BreadcrumbProvider>
      </SidebarInset>
    </>
  );
}