export const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/register", // Keep register if Admin needs to register? or maybe remove if super admin only creates. Keeping for now to be safe.
  "/auth/forgot-password",
  "/auth/reset-password",
  "/unauthorized",
  "/not-found",
];

export const PRIVATE_ROUTE_PREFIXES = [
  "/dashboard",
  "/companies",
  "/plans",
  "/categories",
  "/logs",
  "/settings",
];

export const API_AUTH_PREFIX = "/api/auth";
export const DEFAULT_LOGIN_REDIRECT = "/dashboard"; // Updated to /dashboard
export const UPGRADE_REDIRECT = "/plans"; // Updated to /plans

