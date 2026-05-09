import { BaseUser } from "@/types";
import api from "./api";

export const authService = {
  getMe: async (): Promise<BaseUser | null> => {
    try {
      const response = await api.get<BaseUser>("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar usuário atual:", error);
      return null;
    }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/auth/forgot-password",
      { email }
    );
    return response.data;
  },
};
