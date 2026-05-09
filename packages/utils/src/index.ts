export * from "./cn";
export * from "./format";

import type { MindgestRole } from "@workspace/types";

export const DEFAULT_LOGIN_REDIRECT = "/auth/login";
export const ADMIN_DASHBOARD = "/dashboard";

export const getRouteByRole = (role?: MindgestRole | string): string => {
  if (role === "ADMIN") return ADMIN_DASHBOARD;
  return DEFAULT_LOGIN_REDIRECT;
};

export const getUserRole = (role?: MindgestRole | string): string => {
  if (!role) return "user";
  return role.toLowerCase();
};
