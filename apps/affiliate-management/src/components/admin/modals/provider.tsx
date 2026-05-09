"use client";

import { 
    WithdrawalModals, 
    CommissionModals, 
    LeadDetailsModal, 
    AffiliateDetailsModal 
} from "./";

export function AdminModalProvider() {
    return (
        <>
            <WithdrawalModals />
            <CommissionModals />
            <LeadDetailsModal />
            <AffiliateDetailsModal />
        </>
    );
}
