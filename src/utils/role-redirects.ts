export const DEFAULT_LOGIN_REDIRECT = "/auth/login";
export const ADMIN_DASHBOARD = "/dashboard";

export const getRouteByRole = (role?: string): string => {
  if (role === "ADMIN") return ADMIN_DASHBOARD;
  return DEFAULT_LOGIN_REDIRECT;
};
