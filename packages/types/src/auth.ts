// Tipos base de autenticação
export type MindgestRole = "ADMIN" | "VIEWER" | "MANAGER";

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface BaseUser<TRole = any> {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: TRole;
  company?: any;
  avatar?: string;
}

export interface LoginResponse<TUser = BaseUser<MindgestRole>> {
  message: string;
  user: TUser;
  tokens: Tokens;
}
