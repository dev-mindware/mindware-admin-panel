"use client";

import { ReactNode } from "react";
import type { MindgestPlanType } from "@workspace/types";
import { useAuth } from "@workspace/hooks";
import { useFeatureGate } from "../../contexts/feature-gate-context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

type FeatureGateProps = {
    minPlan: MindgestPlanType;
    children: ReactNode;
    fallback?: "hidden" | "disabled";
};

const PLAN_HIERARCHY: Record<MindgestPlanType, number> = {
    Base: 0,
    Pro: 1,
    Smart: 2,
};

export function FeatureGate({
    minPlan,
    children,
    fallback = "hidden",
}: FeatureGateProps) {
    const { user } = useAuth();
    const { openUpgradeModal } = useFeatureGate();

    // @ts-ignore
    const currentPlan = (user?.company?.subscription?.plan.name as MindgestPlanType) || "Base";

    const currentLevel = PLAN_HIERARCHY[currentPlan] || 0;
    const requiredLevel = PLAN_HIERARCHY[minPlan] || 0;

    const hasAccess = currentLevel >= requiredLevel;

    if (hasAccess) {
        return <>{children}</>;
    }

    if (fallback === "hidden") {
        return null;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openUpgradeModal();
                        }}
                        className="cursor-not-allowed opacity-60 inline-flex"
                    >
                        <div className="pointer-events-none">
                            {children}
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Para ter acesso a este recurso suba de plano</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
