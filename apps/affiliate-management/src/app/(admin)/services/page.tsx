import { PageWrapper } from "@workspace/ui";
import { ServiceList } from "@/components/admin/services/service-list";
import { CreateServiceButton } from "@/components/admin/services/create-service-button";
import { Suspense } from "react";

export default function ServicesPage() {
  return (
    <PageWrapper subRoute="Catálogo de Serviços" routeLabel="Serviços">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Serviços e Comissões</h2>
            <p className="text-muted-foreground">
              Defina os produtos disponíveis para os afiliados e as suas respetivas margens.
            </p>
          </div>
          <CreateServiceButton />
        </div>

        <Suspense fallback={<div>Carregando serviços...</div>}>
          <ServiceList />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
