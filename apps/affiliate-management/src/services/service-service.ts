import { api } from "./api";
import { PaginatedResponse } from "@workspace/types";
import { Service } from "@workspace/types/affiliate";

export const serviceService = {
  getServices: async (page = 1, size = 10) => {
    return api.get<PaginatedResponse<Service>>("/admin/services", {
      params: { page, size }
    });
  },

  getServiceById: async (id: number) => {
    return api.get<Service>(`/admin/services/${id}`);
  },

  createService: async (data: Partial<Service>) => {
    return api.post<Service>("/admin/services", data);
  },

  updateService: async (id: number, data: Partial<Service>) => {
    return api.put<Service>(`/admin/services/${id}`, data);
  },

  deleteService: async (id: number) => {
    return api.delete(`/admin/services/${id}`);
  }
};
