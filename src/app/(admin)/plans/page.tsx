import { PageWrapper, TitleList } from "@/components";

export default function LosPage() {
  return (
    <PageWrapper subRoute="Planos e Faturação">
      <TitleList
        title="Logs"
        suTitle="Controle geral do sistema"
      />
      <div className="space-y-5">
      AQUI VIRA A LISTAGEM DAS AÇÕES DO SISTEMA E TAL..
      </div>
    </PageWrapper>
  );
}
