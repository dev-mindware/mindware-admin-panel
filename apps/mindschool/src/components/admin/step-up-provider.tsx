"use client";

import type { AxiosError } from "axios";
import { StepUpDialog } from "@workspace/ui";
import api from "@/services/api";
import { getApiErrorMessage } from "@/utils/api-error";

/** Janela de reautenticação das acções críticas (motivo + palavra-passe + 2.º factor), ligada ao cliente HTTP desta zone. */
export function StepUpProvider() {
  return (
    <StepUpDialog
      authenticate={async ({ password, code }) => {
        try {
          const { data } = await api.post<{ step_up_token: string; expires_in: number }>("/auth/step-up", { password, ...(code ? { totp_code: code } : {}) });
          return { token: data.step_up_token, expiresIn: data.expires_in };
        } catch (e) {
          throw new Error(getApiErrorMessage(e as AxiosError, "Não foi possível confirmar a sua identidade."));
        }
      }}
    />
  );
}
