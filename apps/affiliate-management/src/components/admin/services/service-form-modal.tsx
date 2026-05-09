"use client";

import { GlobalModal } from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { Service } from "@workspace/types/affiliate";
import { ServiceForm } from "./service-form";

export function ServiceFormModal() {
    const { modalData, closeModal } = useModalStore();
    const service = modalData["edit-service"] as Service;

    return (
        <GlobalModal
            id="edit-service"
            title={service ? "Editar Serviço" : "Novo Serviço"}
            className="sm:max-w-[500px]"
        >
            <ServiceForm 
                service={service} 
                onSuccess={() => closeModal("edit-service")} 
            />
        </GlobalModal>
    );
}
