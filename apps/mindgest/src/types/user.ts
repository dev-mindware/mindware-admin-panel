export type UserRole = "OWNER" | "MANAGER" | "CASHIER";

export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";

export interface UserReference {
  id: string;
  name: string;
  email?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  companyId?: string | null;
  company?: UserReference | null;
  storeId?: string | null;
  storeIds: string[];
  stores?: UserReference[];
  terminalNumber?: string | null;
  barcode?: string | null;
  warning?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  search?: string | null;
  role?: UserRole | null;
  status?: UserStatus | null;
  companyId?: string | null;
  storeId?: string | null;
  sortBy?: "name" | "email" | "role" | "status" | "createdAt" | "updatedAt" | null;
  sortOrder?: "asc" | "desc" | null;
  createdAfter?: string | null;
  createdBefore?: string | null;
}

export interface ResetUserPasswordData {
  userId: string;
  newPassword: string;
}
