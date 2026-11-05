import { api } from "@/services/api";
import type { MemberReport, ReportWeek, TeamReport } from "@/types/report";

interface ReportParams {
  weekEnd?: string;
  userId?: string;
}

async function pdfBlob(path: string, params: ReportParams): Promise<Blob> {
  const { data } = await api.get(path, { params, responseType: "blob" });
  return new Blob([data], { type: "application/pdf" });
}

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement("a");
  a.href = url;
  a.download = filename;
  window.document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export const reportsService = {
  weeks: async (): Promise<ReportWeek[]> => {
    const { data } = await api.get("/reports/weeks");
    return data;
  },

  member: async (params: ReportParams): Promise<MemberReport> => {
    const { data } = await api.get("/reports/weekly", { params });
    return data;
  },

  team: async (params: Pick<ReportParams, "weekEnd">): Promise<TeamReport> => {
    const { data } = await api.get("/reports/team", { params });
    return data;
  },

  downloadMemberPdf: async (params: ReportParams, filename: string): Promise<void> => {
    save(await pdfBlob("/reports/weekly/pdf", params), filename);
  },

  downloadTeamPdf: async (params: Pick<ReportParams, "weekEnd">, filename: string): Promise<void> => {
    save(await pdfBlob("/reports/team/pdf", params), filename);
  },

  generate: async (body: { weekEnd?: string; force?: boolean; notify?: boolean }) => {
    const { data } = await api.post("/reports/generate", body);
    return data;
  },
};
