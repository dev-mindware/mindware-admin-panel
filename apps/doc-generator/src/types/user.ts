export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR";
  allowedDocumentTypes: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
  };
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: "ADMIN" | "EDITOR";
  allowedDocumentTypes?: string[];
}

export interface UpdateUserPayload {
  name?: string;
  role?: "ADMIN" | "EDITOR";
  allowedDocumentTypes?: string[];
  isActive?: boolean;
}

export interface UserListResponse {
  data: AdminUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
