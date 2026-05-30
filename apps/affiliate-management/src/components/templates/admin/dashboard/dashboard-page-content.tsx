import { TitleList } from "@workspace/ui";
import { DashboardContent } from "@/components/admin/dashboard/dashboard-content";

export function DashboardPageContent() {
  return (
    <div className="flex flex-col gap-6">
      <TitleList
        title="Dashboard"
        suTitle="Monitorize afiliados, leads, comissões e pagamentos em tempo real."
      />
      <DashboardContent />
    </div>
  );
}
