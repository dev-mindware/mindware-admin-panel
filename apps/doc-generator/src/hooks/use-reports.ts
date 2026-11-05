"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { errorMessage } from "@/hooks/use-activities";
import { reportsService } from "@/services/reports-service";

export const reportKeys = {
  all: ["reports"] as const,
  weeks: ["reports", "weeks"] as const,
  member: (weekEnd?: string, userId?: string) => ["reports", "member", weekEnd ?? "", userId ?? ""] as const,
  team: (weekEnd?: string) => ["reports", "team", weekEnd ?? ""] as const,
};

const status = (err: unknown) => (err as { response?: { status?: number } })?.response?.status;

/** 404 = ainda não há relatório para a janela (não é um erro de rede). */
export const isReportMissing = (err: unknown) => status(err) === 404;

export function useReportWeeks() {
  return useQuery({ queryKey: reportKeys.weeks, queryFn: reportsService.weeks });
}

export function useMemberReport(weekEnd?: string, userId?: string) {
  return useQuery({
    queryKey: reportKeys.member(weekEnd, userId),
    queryFn: () => reportsService.member({ weekEnd, userId }),
    retry: (count, err) => !isReportMissing(err) && count < 1,
  });
}

export function useTeamReport(weekEnd: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: reportKeys.team(weekEnd),
    queryFn: () => reportsService.team({ weekEnd }),
    enabled,
    retry: (count, err) => !isReportMissing(err) && count < 1,
  });
}

export function useGenerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { weekEnd?: string; force?: boolean }) =>
      reportsService.generate({ ...body, notify: false }),
    onSuccess: () => {
      toast.success("Relatório gerado");
      return qc.invalidateQueries({ queryKey: reportKeys.all });
    },
    onError: (err) => toast.error(errorMessage(err, "Não foi possível gerar o relatório")),
  });
}

export function useDownloadPdf() {
  return useMutation({
    mutationFn: (run: () => Promise<void>) => run(),
    onError: (err) => toast.error(errorMessage(err, "Não foi possível descarregar o PDF")),
  });
}
