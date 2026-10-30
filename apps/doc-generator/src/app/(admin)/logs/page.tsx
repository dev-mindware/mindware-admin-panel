import { AuditLogsContent } from "@/components/admin/logs/audit-logs-content";

export const metadata = {
  title: "Logs de Auditoria | Doc Generator",
  description: "Registo completo de todas as ações realizadas no sistema",
};

export default function AuditLogsPage() {
  return <AuditLogsContent />;
}
