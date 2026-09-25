export const ACCESS_TOKEN_KEY =
  process.env.NEXT_PUBLIC_JWT_ACCESS_COOKIE_NAME ||
  process.env.JWT_ACCESS_COOKIE_NAME ||
  process.env.ACCESS_TOKEN_COOKIE_NAME ||
  process.env.ACCESS_TOKEN_KEY ||
  "mindware_doc_access_token";

export const REFRESH_TOKEN_KEY =
  process.env.NEXT_PUBLIC_JWT_REFRESH_COOKIE_NAME ||
  process.env.JWT_REFRESH_COOKIE_NAME ||
  process.env.REFRESH_TOKEN_COOKIE_NAME ||
  process.env.REFRESH_TOKEN_KEY ||
  "mindware_doc_refresh_token";

export const USER_KEY =
  process.env.NEXT_PUBLIC_USER_KEY ||
  process.env.USER_KEY ||
  "mindware_doc_user";
