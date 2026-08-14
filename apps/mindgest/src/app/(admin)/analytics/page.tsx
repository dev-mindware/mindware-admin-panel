import { PageWrapper, TitleList } from "@/components";
import { ProductAnalyticsDashboard } from "@/components/admin/analytics/product-analytics-dashboard";

export const metadata = {
  title: "Product Analytics & Observabilidade | Mindgest",
};

export default function AnalyticsPage() {
  return (
    <PageWrapper subRoute="Product Analytics" routeLabel="Product Analytics">
      <TitleList
        title="Product Analytics"
        suTitle="Métricas de produto, inteligência comercial, funil de onboarding e saúde de empresas"
      />
      <div className="mt-6">
        <ProductAnalyticsDashboard />
      </div>
    </PageWrapper>
  );
}
