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
          title="Serviços e Comissões"
          suTitle="Defina os produtos disponíveis para afiliados e as suas margens."
        />
        <CreateServiceButton />
      </div>

      <Suspense fallback={<div>A carregar serviços...</div>}>
        <ServiceList />
      </Suspense>
    </div>
  );
}
