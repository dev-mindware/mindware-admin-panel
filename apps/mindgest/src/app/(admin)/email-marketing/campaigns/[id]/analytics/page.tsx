import { PageWrapper, TitleList } from "@/components";
import { CampaignAnalyticsContent } from "@/components/admin/email-center";
import { Suspense } from "react";

interface CampaignAnalyticsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignAnalyticsPage({ params }: CampaignAnalyticsPageProps) {
  const { id } = await params;

  return (
    <PageWrapper subRoute="Analytics" routeLabel="Email Marketing / Analytics">
      <TitleList
        title="Analytics da Campanha"
        suTitle="Métricas detalhadas de entrega, aberturas, cliques e receita recuperada"
      />
      <Suspense fallback={<div>Carregando analytics...</div>}>
        <CampaignAnalyticsContent campaignId={id} />
      </Suspense>
    </PageWrapper>
  );
}
