import React from "react";
import { AuditLogsContent } from "@/components/admin/logs/audit-logs-content";

export const metadata = {
  title: "Logs de Auditoria | Doc Generator",
  description: "Registo completo de todas as ações realizadas no sistema",
};

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Logs de Auditoria</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Registo completo e imutável de todas as ações realizadas no sistema, incluindo criação de utilizadores, aprovação de documentos e sincronizações de deploy.
        </p>
      </div>
      <AuditLogsContent />
    </div>
  );
}
