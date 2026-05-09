// Tipo genérico de estatística para cards de dashboard
export type Stats = {
  title: string;
  value: string | number;
  icon: string;
  description: string;
  color?: string;
  bgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
};

// Tipo de plano de subscrição específico do Mindgest
export type MindgestPlanType = "Base" | "Pro" | "Smart";

// Tipo de visualização
export type ViewMode = "card" | "table";

// Resposta paginada genérica da API
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Resposta base da API
export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
  success?: boolean;
}

// Parâmetros de paginação para query params
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Estado base de filtros
export interface BaseFilters {
  page: number;
  limit: number;
  search: string;
}
