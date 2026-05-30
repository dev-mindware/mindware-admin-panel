"use client";

import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger, TitleList } from "@workspace/ui";
import { ServiceList } from "@/components/admin/services/service-list";
import { CreateServiceButton } from "@/components/admin/services/create-service-button";
import { PartnerPlanList } from "@/components/admin/services/partner-plan-list";

export function ServicesPageContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TitleList
          title="Serviços e Planos"
          suTitle="Defina os serviços comerciais e acompanhe os planos Mindgest disponíveis para afiliados."
        />
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="plans">Planos Mindgest</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="flex justify-end">
            <CreateServiceButton />
          </div>
          <Suspense fallback={<div>A carregar serviços...</div>}>
            <ServiceList />
          </Suspense>
        </TabsContent>

        <TabsContent value="plans">
          <Suspense fallback={<div>A carregar planos...</div>}>
            <PartnerPlanList />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
