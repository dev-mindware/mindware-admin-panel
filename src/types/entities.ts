import { Category } from "./category";

export type ClientData = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  taxNumber: string;
  companyId?: string;
};

export type ClientResponse = ClientData & {
  id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface StoresResponse {
  data: Stores[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Stores {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  categories?: Category[];
}

export type SupplierData = {
  name: string;
  type: "emp" | "par";
  phone: string;
  email: string;
  nif: string;
  address: string;
  supplyType: "src" | "prd" | "amb";
  deliveryTime: string;
  products: string[];
};

export type SupplierResponse = SupplierData & {
  id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
