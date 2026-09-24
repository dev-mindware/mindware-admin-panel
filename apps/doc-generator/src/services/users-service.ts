import { api } from "@/services/api";
import {
  AdminUser,
  CreateUserPayload,
  UpdateUserPayload,
  UserListResponse,
} from "@/types/user";

export const usersService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<UserListResponse> => {
    const { data } = await api.get("/users", { params });
    return data;
  },

  getById: async (id: string): Promise<AdminUser> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  create: async (payload: CreateUserPayload): Promise<AdminUser> => {
    const { data } = await api.post("/users", payload);
    return data;
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<AdminUser> => {
    const { data } = await api.patch(`/users/${id}`, payload);
    return data;
  },

  resetPassword: async (id: string, newPassword: string): Promise<{ message: string }> => {
    const { data } = await api.patch(`/users/${id}/reset-password`, { newPassword });
    return data;
  },

  deactivate: async (id: string): Promise<AdminUser> => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
};
