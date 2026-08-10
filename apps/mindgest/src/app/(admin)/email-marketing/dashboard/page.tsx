import { PageWrapper, TitleList, Button, Icon } from "@/components";
import { EmailKpiCards } from "@/components/admin/email-center";
import { Suspense } from "react";
import Link from "next/link";

export default function EmailMarketingPage() {
  return (
    <PageWrapper subRoute="Dashboard" routeLabel="Email Marketing / Dashboard">
      <TitleList title="Email Marketing" suTitle="Centro de Email Marketing e Cobrança">
        <div className="flex items-center gap-2">
          <Link href="/email-marketing/campaigns/new?segment=EXPIRED">
            <Button className="shadow-lg shadow-primary/20">
              <Icon name="Mail" className="w-4 h-4 mr-2" />
              Enviar aos Expirados
            </Button>
          </Link>
          <Link href="/email-marketing/campaigns/new">
            <Button variant="outline">
              <Icon name="Plus" className="w-4 h-4 mr-2" />
              Nova Campanha
            </Button>
          </Link>
        </div>
      </TitleList>

      <Suspense fallback={<div>Carregando indicadores...</div>}>
        <EmailKpiCards />
      </Suspense>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        <Link
          href="/email-marketing/campaigns"
          className="group rounded-xl border border-border bg-card p-5 flex items-start gap-4 hover:border-primary/50 hover:shadow-md transition-all duration-200"
        >
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon name="ChartBar" className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
              Campanhas
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Gerir e acompanhar todas as campanhas de email.</p>
          </div>
        </Link>

        <Link
          href="/email-marketing/templates"
          className="group rounded-xl border border-border bg-card p-5 flex items-start gap-4 hover:border-primary/50 hover:shadow-md transition-all duration-200"
        >
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon name="File" className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
              Templates
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Biblioteca de 15 templates prontos a usar.</p>
          </div>
        </Link>

        <Link
          href="/email-marketing/automations"
          className="group rounded-xl border border-border bg-card p-5 flex items-start gap-4 hover:border-primary/50 hover:shadow-md transition-all duration-200"
        >
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon name="Zap" className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
              Automações
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Régua de cobrança automática por subscrição.</p>
          </div>
        </Link>
      </div>

    </PageWrapper>
  );
}
