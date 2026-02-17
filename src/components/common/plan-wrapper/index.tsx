"use client";
import { useAuth } from "@/hooks/auth";
import { PlanType } from "@/types";
import { useEffect, useState } from "react";

type WrapperProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  minPlan: PlanType;
  planOverride?: string | PlanType;
};

const order: Record<PlanType, number> = {
  "Base": 1,
  "Pro": 2,
  "Smart": 3,
};

function normalizePlan(raw: unknown): PlanType | null {
  if (typeof raw !== "string") return null;
  const x = raw.toUpperCase().replace(/[-\s]/g, "_");
  if (x.includes("Smart")) return "Smart";
  if (x.includes("Pro")) return "Pro";
  if (x.includes("Base")) return "Base";
  return null;
}

function useUserPlan(): PlanType {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanType>("Base");
  
  useEffect(() => {
    const raw = user?.company?.subscription?.plan! 
    const norm = normalizePlan(raw);
    if (norm) setPlan(norm);
  }, []);
  return plan;
}

function hasPlan(userPlan: PlanType, required: PlanType) {
  return order[userPlan] >= order[required];
}

export function PlanWrapper({ children, minPlan, planOverride, ...rest }: WrapperProps) {
  const detected = useUserPlan();
  const effective = normalizePlan(planOverride ?? detected) ?? "Base";
  if (!hasPlan(effective, minPlan)) return null;
  return <div {...rest}>{children}</div>;
}

export function BaseOnly(props: Omit<WrapperProps, "minPlan">) {
  return <PlanWrapper minPlan="Base" {...props} />;
}
export function ProOnly(props: Omit<WrapperProps, "minPlan">) {
  return <PlanWrapper minPlan="Pro" {...props} />;
}

export function SmartOnly(props: Omit<WrapperProps, "minPlan">) {
  return <PlanWrapper minPlan="Smart" {...props} />;
}
