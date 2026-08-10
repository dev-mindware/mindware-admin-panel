"use client";

import { PageWrapper, TitleList } from "@/components";
import { CampaignEditor } from "@/components/admin/email-center";

export default function NewCampaignPage() {
  return (
    <PageWrapper subRoute="Nova Campanha" routeLabel="Email Marketing / Nova Campanha">
      <TitleList title="Nova Campanha" suTitle="Crie e agende uma nova campanha de email" />
      <CampaignEditor />
    </PageWrapper>
  );
}
