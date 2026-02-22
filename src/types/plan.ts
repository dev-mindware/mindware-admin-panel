export interface PlanFeatures {
  hasPos: boolean;
  canExportSaft: boolean;
  hasStock: boolean;
  hasInvoices: boolean;
  hasReporting: boolean;
  hasSuppliers: boolean;
  hasAppearance?: boolean;
  hasPrintFormats?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  priceMonthly: string | number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  order: number;
  maxUsers: number;
  maxStores: number;
  trialPeriodInDays: number | null;
  features: PlanFeatures;
}

export interface PlanCreateInput {
  name: string;
  priceMonthly: number;
  isPublic: boolean;
  maxUsers: number;
  maxStores: number;
  trialPeriodInDays: number | null;
  billingIntervals: string[];
  features: PlanFeatures;
}
