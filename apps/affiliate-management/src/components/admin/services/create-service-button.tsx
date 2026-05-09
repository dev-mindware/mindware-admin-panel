"use client";

import { Button } from "@workspace/ui";
import { Plus } from "lucide-react";
import { useModalStore } from "@workspace/hooks";

export function CreateServiceButton() {
  const { openModal } = useModalStore();

  return (
    <Button className="flex items-center gap-2" onClick={() => openModal("edit-service")}>
      <Plus className="size-4" />
      Novo Serviço
    </Button>
  );
}
