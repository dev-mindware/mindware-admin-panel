import axios from "axios";

/**
 * Public API client for unauthenticated requests
 * Used for public endpoints like document verification
 */
const isBrowser =
  typeof window !== "undefined" && process.env.NODE_ENV !== "test";
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "/mindgest").replace(
  /\/+$/,
  "",
);

export const publicApi = axios.create({
  baseURL: isBrowser
    ? `${basePath}/api/proxy`
    : process.env.NEXT_PUBLIC_API_URL || "https://mindgest-api.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
    ...(typeof window === "undefined" && process.env.API_KEY
      ? { "x-api-key": process.env.API_KEY }
      : {}),
  },
});

// No authentication interceptors for public API
export default publicApi;
