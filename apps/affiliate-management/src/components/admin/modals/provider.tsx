"use client";

import {
    WithdrawalModals,
    CommissionModals,
    LeadDetailsModal,
    AffiliateDetailsModal,
    SubscriptionModals
} from "./";

export function AdminModalProvider() {
    return (
        <>
            <WithdrawalModals />
            <CommissionModals />
            <LeadDetailsModal />
            <AffiliateDetailsModal />
            <SubscriptionModals />
        </>
    );
}
