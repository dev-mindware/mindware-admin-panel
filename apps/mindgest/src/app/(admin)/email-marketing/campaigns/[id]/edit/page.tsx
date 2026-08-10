"use client";

import { PageWrapper, TitleList } from "@/components";
import { CampaignEditor } from "@/components/admin/email-center";
import { useEmailCampaign } from "@/hooks/email-center";
import { use } from "react";

interface EditCampaignPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCampaignPage({ params }: EditCampaignPageProps) {
  const { id } = use(params);
  const { data: campaign, isLoading } = useEmailCampaign(id);

  if (isLoading) {
    return (
      <PageWrapper subRoute="Editar Campanha" routeLabel="Email Marketing / Editar">
        <div>Carregando campanha...</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper subRoute="Editar Campanha" routeLabel={`Email Marketing / ${campaign?.name ?? "Editar"}`}>
      <TitleList title={`Editar: ${campaign?.name ?? ""}`} suTitle="Atualize o conteúdo ou agendamento da campanha" />
      <CampaignEditor initial={campaign} />
    </PageWrapper>
  );
}
