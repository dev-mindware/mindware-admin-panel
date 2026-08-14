import { PageWrapper, TitleList } from "@/components";
import { SystemLogsContent } from "@/components/admin/logs/system-logs-content";

export const metadata = {
  title: "Logs e Auditoria do Sistema | Mindgest",
};

export default function LogsPage() {
  return (
    <PageWrapper subRoute="Logs e Auditoria">
      <TitleList
        title="Logs e Auditoria do Sistema"
        suTitle="Controlo técnico, rastreabilidade de ações e auditoria global"
      />
      <div className="mt-6">
        <SystemLogsContent />
      </div>
    </PageWrapper>
  );
}
