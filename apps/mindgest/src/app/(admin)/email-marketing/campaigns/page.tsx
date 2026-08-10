import { PageWrapper, TitleList, Button, Icon } from "@/components";
import { CampaignList } from "@/components/admin/email-center";
import { Suspense } from "react";
import Link from "next/link";

export default function CampaignsPage() {
  return (
    <PageWrapper subRoute="Campanhas" routeLabel="Email Marketing / Campanhas">
      <TitleList title="Campanhas de Email" suTitle="Histórico e gestão de campanhas">
        <Link href="/email-marketing/campaigns/new">
          <Button className="shadow-lg shadow-primary/20">
            <Icon name="Plus" className="w-4 h-4 mr-2" />
            Nova Campanha
          </Button>
        </Link>
      </TitleList>

      <Suspense fallback={<div>Carregando campanhas...</div>}>
        <CampaignList />
      </Suspense>
    </PageWrapper>
  );
}
