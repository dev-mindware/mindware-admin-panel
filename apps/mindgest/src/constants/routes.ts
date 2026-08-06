export const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/unauthorized",
  "/not-found",
];

export const PRIVATE_ROUTE_PREFIXES = [
  "/dashboard",
  "/companies",
  "/users",
  "/plans",
  "/subscriptions",
  "/logs",
  "/definitions",
  "/settings",
  "/categories",
];

export const BASE_PATH = "/mindgest";
export const API_AUTH_PREFIX = "/api/auth";

/** Where unauthenticated users are sent (middleware). */
export const DEFAULT_LOGIN_REDIRECT = "/auth/login";

/** Where authenticated users leave auth pages (middleware). */
export const DEFAULT_AUTHENTICATED_REDIRECT = "/dashboard";

export const UPGRADE_REDIRECT = "/plans";
