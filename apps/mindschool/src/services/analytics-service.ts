import api from "./api";
import type { Analytics } from "@/types/api";

export const analyticsService = {
  overview: async (months = 12): Promise<Analytics> => (await api.get("/admin/analytics/overview", { params: { months } })).data,
};
