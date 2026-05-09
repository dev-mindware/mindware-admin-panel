"use client";

import { createContext, useContext, ReactNode, useCallback } from "react";
import { useModalStore } from "@workspace/hooks";
import { UPGRADE_PLAN_MODAL_ID } from "@workspace/ui";

interface FeatureGateContextType {
    openUpgradeModal: () => void;
}

const FeatureGateContext = createContext<FeatureGateContextType | undefined>(
    undefined
);

export function FeatureGateProviderContext({ children }: { children: ReactNode }) {
    const { openModal } = useModalStore();

    const openUpgradeModal = useCallback(() => {
        openModal(UPGRADE_PLAN_MODAL_ID);
    }, [openModal]);

    return (
        <FeatureGateContext.Provider value={{ openUpgradeModal }}>
            {children}
        </FeatureGateContext.Provider>
    );
}

export function useFeatureGate() {
    const context = useContext(FeatureGateContext);
    if (context === undefined) {
        throw new Error("useFeatureGate must be used within a FeatureGateProvider");
    }
    return context;
}
