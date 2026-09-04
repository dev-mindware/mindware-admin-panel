import { api } from "./api";
import { PaginatedResult, PaginationParams } from "@/types/pagination";

export interface Client {
  id: string;
  name: string;
  tradeName?: string | null;
  nif: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  name: string;
  tradeName?: string;
  nif: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export const clientsService = {
  async getClients(params?: PaginationParams): Promise<PaginatedResult<Client>> {
    try {
      const response = await api.get<any>("/clients", {
        params,
      });
      const res = response.data;
      if (Array.isArray(res)) {
        return {
          data: res,
          meta: {
            total: res.length,
            page: 1,
            limit: res.length,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
          total: res.length,
          page: 1,
          limit: res.length,
          totalPages: 1,
        };
      }
      return {
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta || {
          total: res?.total || 0,
          page: res?.page || 1,
          limit: res?.limit || 10,
          totalPages: res?.totalPages || 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        total: res?.total ?? res?.meta?.total ?? 0,
        page: res?.page ?? res?.meta?.page ?? 1,
        limit: res?.limit ?? res?.meta?.limit ?? 10,
        totalPages: res?.totalPages ?? res?.meta?.totalPages ?? 1,
      };
    } catch {
      return {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
    }
  },

  async getClientById(id: string): Promise<Client> {
    const response = await api.get<Client>(`/clients/${id}`);
    return response.data;
  },

  async createClient(data: CreateClientDto): Promise<Client> {
    const response = await api.post<Client>("/clients", data);
    return response.data;
  },
};
