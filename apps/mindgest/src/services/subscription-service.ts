import { api } from "./api";
import { SubscriptionFormData } from "@/schemas";
import { Subscription, SubscriptionStatus } from "@/types";

type Data = Pick<SubscriptionFormData, "planId" | "frequency" | "proofPayment">;

export interface SubscriptionResponse {
  id: string;
  status: SubscriptionStatus;
  trialEndsAt: any;
  periodStartsAt: string;
  periodEndsAt: string;
  canceledAt: any;
  createdAt: string;
  updatedAt: string;
  billingPeriodInMonths: number;
  paymentProvider: any;
  providerClientId: any;
  providerSubscriptionId: any;
  proofFileUrl: string;
  companyId: string;
  planId: string;
}

export const subscriptionService = {
  createSubscription: async (data: Data) => {
    return api.post<SubscriptionResponse>("/subscriptions", {
      planId: data.planId,
      frequency: data.frequency,
      proofPayment: data.proofPayment,
    });
  },
  getSubscriptions: async () => {
    return api.get<Subscription[]>("/subscriptions");
  },
  updateSubscriptionStatus: async (id: string, status: SubscriptionStatus) => {
    return api.patch<SubscriptionResponse>(`/subscriptions/${id}`, { status });
  },
};

