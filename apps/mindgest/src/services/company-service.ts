import type {
  BaseUser as CompanyResponse,
  CompanyData,
  Company,
  UpdateCompanyPayload,
} from "@/types";
import { api } from "./api";

export const companyService = {
  addCompany: async (data: CompanyData) => {
    return api.post<CompanyResponse>("/companies", data);
  },
  getCompanies: async () => {
    return api.get<Company[]>("/companies");
  },
  updateCompany: async (id: string, data: UpdateCompanyPayload) => {
    return api.put<Company>(`/companies/${id}`, data);
  },
  toggleCompanyStatus: async (id: string) => {
    return api.patch(`/companies/${id}/toggle-status`);
  },
};
