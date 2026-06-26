import { redirect } from "next/navigation";
import { AppSidebar, BreadcrumbProvider, SidebarInset } from "@/components";
import { RouteProtector } from "@/contexts";
import { getSession } from "@/lib/auth";

/**
 * Server-side gate: read the HttpOnly session cookie before any HTML is sent.
 * redirect() respects the Next.js basePath, so the browser receives
 * "Location: /mindgest/auth/login" — no client-side JS required.
 */
export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <RouteProtector allowed={["ADMIN"]}>
      <AppSidebar />
      <SidebarInset>
        <BreadcrumbProvider>{children}</BreadcrumbProvider>
      </SidebarInset>
    </RouteProtector>
  );
}
