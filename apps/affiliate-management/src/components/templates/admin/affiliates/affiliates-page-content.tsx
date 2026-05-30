"use client";

import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button, TitleList } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { AffiliateList } from "@/components/admin/affiliates/affiliate-list";

export function AffiliatesPageContent() {
  const { openModal } = useModalStore();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TitleList
          title="Afiliados"
          suTitle="Faça a gestão dos parceiros, aprove cadastros e acompanhe a performance."
        />
        <Button className="flex items-center gap-2" onClick={() => openModal("edit-affiliate")}>
          <Plus className="size-4" />
          Novo afiliado
        </Button>
      </div>
      <Suspense fallback={<div>A carregar afiliados...</div>}>
        <AffiliateList />
      </Suspense>
    </div>
  );
}
