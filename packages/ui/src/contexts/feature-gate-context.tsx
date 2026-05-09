"use client";

import { createContext, useContext, ReactNode } from "react";

interface FeatureGateContextType {
    openUpgradeModal: () => void;
}

const FeatureGateContext = createContext<FeatureGateContextType | undefined>(
    undefined
);

export function FeatureGateProvider({ 
    children, 
    onOpenUpgradeModal 
}: { 
    children: ReactNode;
    onOpenUpgradeModal: () => void;
}) {
    return (
        <FeatureGateContext.Provider value={{ openUpgradeModal: onOpenUpgradeModal }}>
            {children}
        </FeatureGateContext.Provider>
    );
}

export function useFeatureGate() {
    const context = useContext(FeatureGateContext);
    if (context === undefined) {
        // Return a dummy to avoid crashes if not used, or throw
        return { openUpgradeModal: () => console.warn("FeatureGateProvider not found") };
    }
    return context;
}
