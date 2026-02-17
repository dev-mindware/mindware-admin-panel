import { AppSidebar, BreadcrumbProvider, SidebarInset } from "@/components";
import { RouteProtector } from "@/contexts";

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteProtector allowed={["ADMIN"]}>
      <AppSidebar />
      <SidebarInset>
        <BreadcrumbProvider>{children}</BreadcrumbProvider>
      </SidebarInset>
    </RouteProtector>
  );
}
