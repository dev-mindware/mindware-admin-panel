export type UserRole = "ADMIN" | "EDITOR";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  allowedDocumentTypes: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: string;
}

export interface AuthResponse {
  message?: string;
  user: User;
  tokens: AuthTokens;
}
