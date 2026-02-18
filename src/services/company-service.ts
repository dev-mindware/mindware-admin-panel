import type { User as CompanyResponse, CompanyData, Company } from "@/types";
import { api } from "./api";

export const companyService = {
  addCompany: async (data: CompanyData) => {
    return api.post<CompanyResponse>("/companies", data);
  },
  getCompanies: async () => {
    return api.get<Company[]>("/companies");
  },
  toggleCompanyStatus: async (id: string) => {
    return api.patch(`/companies/${id}/toggle-status`);
  },
};
