"use client";
import { useAuth } from "@workspace/hooks";
import { MindgestPlanType } from "@workspace/types";
import { useEffect, useState } from "react";

type WrapperProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  minPlan: MindgestPlanType;
  planOverride?: string | MindgestPlanType;
};

const order: Record<MindgestPlanType, number> = {
  "Base": 1,
  "Pro": 2,
  "Smart": 3,
};

function normalizePlan(raw: unknown): MindgestPlanType | null {
  if (typeof raw !== "string") return null;
  const x = raw.toUpperCase().replace(/[-\s]/g, "_");
  if (x.includes("Smart")) return "Smart";
  if (x.includes("Pro")) return "Pro";
  if (x.includes("Base")) return "Base";
  return null;
}

function useUserPlan(): MindgestPlanType {
  const { user } = useAuth();
  const [plan, setPlan] = useState<MindgestPlanType>("Base");
  
  useEffect(() => {
    const raw = user?.company?.subscription?.plan! 
    const norm = normalizePlan(raw);
    if (norm) setPlan(norm);
  }, []);
  return plan;
}

function hasPlan(userPlan: MindgestPlanType, required: MindgestPlanType) {
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
