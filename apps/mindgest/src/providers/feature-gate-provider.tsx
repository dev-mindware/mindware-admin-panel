"use client";

import { ReactNode } from "react";
import { FeatureGateProviderContext } from "@/contexts/feature-gate-context";
import { UpgradePlanModal } from "@workspace/ui";

export function FeatureGateProvider({ children }: { children: ReactNode }) {
    return (
        <FeatureGateProviderContext>
            {children}
            <UpgradePlanModal />
        </FeatureGateProviderContext>
    );
}
