import { AppSidebar, BreadcrumbProvider, SidebarInset } from "@/components";
import { AdminModalProvider } from "@/components/admin";
import { RouteProtector } from "@/contexts/route-protector";

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteProtector allowed={["admin"]}>
      <AdminModalProvider />
      <AppSidebar />
      <SidebarInset>
        <BreadcrumbProvider>{children}</BreadcrumbProvider>
      </SidebarInset>
    </RouteProtector>
  );
}
