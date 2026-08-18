"use client";

import { Button, Icon } from "@/components";
import { useCheckSubscriptionExpirations } from "@/hooks/subscription";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

export function SubscriptionHeaderActions() {
  const { mutateAsync: checkExpirations, isPending } =
    useCheckSubscriptionExpirations();

  const handleCheck = async () => {
    try {
      const response = await checkExpirations();
      SucessMessage(
        response.data?.message ||
          "Varredura de expirações e alertas executada com sucesso!",
      );
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message ||
          "Erro ao executar verificação de expiração de subscrições",
      );
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCheck}
        disabled={isPending}
        className="h-9 text-xs sm:text-sm font-medium"
      >
        <Icon
          name="RefreshCw"
          className={`w-3.5 h-3.5 mr-2 ${isPending ? "animate-spin" : ""}`}
        />
        {isPending ? "A verificar..." : "Verificar Expirações"}
      </Button>
    </div>
  );
}
