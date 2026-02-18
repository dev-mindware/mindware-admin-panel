import { PageWrapper, CompanyList, TitleList } from "@/components";

export default function Page() {
    return (
        <PageWrapper subRoute="Companies" routeLabel="Empresas">
            <TitleList title="Empresas" suTitle="Lista de Empresas" />
            <CompanyList />
        </PageWrapper>
    );
}
