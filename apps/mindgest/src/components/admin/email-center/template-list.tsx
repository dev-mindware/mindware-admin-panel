"use client";

import { useEmailTemplates } from "@/hooks/email-center";
import { Skeleton, RequestError, Button, Icon } from "@/components";
import { useRouter } from "next/navigation";
import type { EmailTemplate } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  BILLING: "Cobrança",
  MARKETING: "Marketing",
};

function TemplateCard({ template }: { template: EmailTemplate }) {
  const router = useRouter();
  return (
    <div className="group rounded-xl border border-border bg-card p-5 flex flex-col gap-3 hover:border-primary/50 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${
            template.category === "BILLING"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-primary/10 text-primary"
          }`}>
            {CATEGORY_LABELS[template.category] ?? template.category}
          </span>
          <h4 className="font-semibold text-foreground text-sm leading-tight truncate">
            {template.name}
          </h4>
          <p className="text-xs text-muted-foreground mt-1 truncate">{template.subject}</p>
        </div>
        {template.isSystemDefault && (
          <span className="shrink-0 text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">
            Padrão
          </span>
        )}
      </div>
      {template.preheader && (
        <p className="text-xs text-muted-foreground line-clamp-2">{template.preheader}</p>
      )}
      <div className="flex gap-2 mt-auto pt-2">
        <Button
          size="sm"
          className="flex-1 text-xs"
          onClick={() =>
            router.push(
              `/email-marketing/campaigns/new?templateId=${template.id}`
            )
          }
        >
          <Icon name="Send" className="w-3.5 h-3.5 mr-1" />
          Usar
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs"
          onClick={() =>
            router.push(
              `/email-marketing/campaigns/new?templateId=${template.id}&duplicate=1`
            )
          }
        >
          <Icon name="Copy" className="w-3.5 h-3.5 mr-1" />
          Duplicar
        </Button>
      </div>
    </div>
  );
}

export function TemplateList() {
  const { data: templates, isLoading, isError, refetch } = useEmailTemplates();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <RequestError refetch={refetch} message="Erro ao carregar templates" />;
  }

  const billing = templates?.filter((t) => t.category === "BILLING") ?? [];
  const marketing = templates?.filter((t) => t.category === "MARKETING") ?? [];

  return (
    <div className="space-y-8 pt-4">
      {billing.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
            <Icon name="Receipt" className="w-4 h-4 text-primary" />
            Templates de Cobrança
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {billing.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        </div>
      )}
      {marketing.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
            <Icon name="Megaphone" className="w-4 h-4 text-primary" />
            Templates de Marketing
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {marketing.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
