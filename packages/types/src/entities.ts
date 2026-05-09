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
