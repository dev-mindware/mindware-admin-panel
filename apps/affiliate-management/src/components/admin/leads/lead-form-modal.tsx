"use client";

import { GlobalModal } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { RegisterLeadForm } from "./register-lead-form";

export function LeadFormModal() {
    const { closeModal } = useModalStore();

    return (
        <GlobalModal
            id="create-lead"
            title="Registrar Novo Lead"
            className="sm:max-w-[600px]"
        >
            <RegisterLeadForm 
                onSuccess={() => closeModal("create-lead")} 
                onCancel={() => closeModal("create-lead")}
            />
        </GlobalModal>
    );
}
