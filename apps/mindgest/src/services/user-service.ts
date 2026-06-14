import type { ResetUserPasswordData } from "@/types";
import { api } from "./api";

export const userService = {
  resetPassword: async (data: ResetUserPasswordData) => {
    return api.post("/users/admin/reset-password", data);
  },
};
