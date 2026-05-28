"use client";

import { Suspense } from "react";
import { TitleList } from "@workspace/ui";
import { ServiceList } from "@/components/admin/services/service-list";
import { CreateServiceButton } from "@/components/admin/services/create-service-button";

export function ServicesPageContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TitleList
          title="Servicos e Comissoes"
          suTitle="Defina os produtos disponiveis para afiliados e as suas margens."
        />
        <CreateServiceButton />
      </div>

      <Suspense fallback={<div>Carregando servicos...</div>}>
        <ServiceList />
      </Suspense>
    </div>
  );
}
