"use client";

import { ReactNode } from "react";
import { FeatureGateProviderContext } from "@/contexts/feature-gate-context";
import { UpgradePlanModal } from "@/components/common/modal/upgrade-plan-modal";

export function FeatureGateProvider({ children }: { children: ReactNode }) {
    return (
        <FeatureGateProviderContext>
            {children}
            <UpgradePlanModal />
        </FeatureGateProviderContext>
    );
}
