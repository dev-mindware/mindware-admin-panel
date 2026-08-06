"use client";

import { GlobalModal } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { Affiliate } from "@workspace/types/affiliate";
import { RegisterLeadForm } from "./register-lead-form";

export function LeadFormModal() {
    const { modalData, closeModal } = useModalStore();
    const affiliate = modalData["create-lead"] as Affiliate | undefined;

    return (
        <GlobalModal
            id="create-lead"
            title={affiliate ? `Atribuir Cliente Lead a ${affiliate.nome_completo}` : "Atribuir / Registrar Cliente Lead"}
            className="sm:max-w-[600px]"
        >
            <RegisterLeadForm 
                initialAffiliateCode={affiliate?.codigo_afiliado}
                onSuccess={() => closeModal("create-lead")} 
                onCancel={() => closeModal("create-lead")}
            />
        </GlobalModal>
    );
}

