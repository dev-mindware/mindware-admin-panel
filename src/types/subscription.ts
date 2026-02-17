import { Company } from "./company";

export interface Subscription {
  id: string
  status: SubscriptionStatus
  trialEndsAt: any
  periodStartsAt: string
  periodEndsAt: string
  canceledAt: any
  createdAt: string
  updatedAt: string
  billingPeriodInMonths: number
  paymentProvider: any
  providerClientId: any
  providerSubscriptionId: any
  proofFileUrl: any
  companyId: string
  planId: string
  plan: Plan
  company: Company
}

export interface Plan {
  id: string
  name: string
  priceMonthly: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  order: number
  maxUsers: number
  maxStores: number
  trialPeriodInDays: any
  features: Features
}

export interface Features {
  pos: Pos
  saft: Saft
  stock: Stock
  invoices: Invoices
  reporting: Reporting
  suppliers: Suppliers
  appearance: Appearance
  print_formats: PrintFormats
}

export interface Pos {
  enabled: boolean
}

export interface Saft {
  enabled: boolean
}

export interface Stock {
  enabled: boolean
}

export interface Invoices {
  limit: number
  enabled: boolean
}

export interface Reporting {
  enabled: boolean
  metadata: Metadata
}

export interface Metadata {
  mode: string
}

export interface Suppliers {
  enabled: boolean
}

export interface Appearance {
  enabled: boolean
}

export interface PrintFormats {
  enabled: boolean
}

export type PlanType = "Base" | "Pro" | "Smart";

export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "TRIALING" | "PAST_DUE" | "PENDING" | "EXPIRED";