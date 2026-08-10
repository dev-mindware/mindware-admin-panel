import { PageWrapper, TitleList } from "@/components";
import { TemplateList } from "@/components/admin/email-center";
import { Suspense } from "react";

export default function TemplatesPage() {
  return (
    <PageWrapper subRoute="Templates" routeLabel="Email Marketing / Templates">
      <TitleList
        title="Templates de Email"
        suTitle="Biblioteca de 15 modelos profissionais de cobrança e marketing"
      />
      <Suspense fallback={<div>Carregando templates...</div>}>
        <TemplateList />
      </Suspense>
    </PageWrapper>
  );
}
