import { redirect } from "next/navigation";
import { BreadcrumbProvider, SidebarInset } from "@workspace/ui";
import { AppSidebar } from "@/components/app-sidebar";
import { MfaEnrollmentDialog } from "@/components/admin/mfa-enrollment-dialog";
import { StepUpProvider } from "@/components/admin/step-up-provider";
import { RouteProtector } from "@/contexts/route-protector";
import { getSession } from "@/lib/auth";

/** Barreira no servidor: sem sessão, o utilizador nem chega a receber a página (o redirect respeita o basePath). */
export default async function ManagementLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  return (
    <RouteProtector>
      <AppSidebar />
      <SidebarInset>
        <BreadcrumbProvider>{children}</BreadcrumbProvider>
      </SidebarInset>
      <StepUpProvider />
      <MfaEnrollmentDialog />
    </RouteProtector>
  );
}
