"use client";

import { useEffect, useState } from "react";
import {
    GlobalModal,
    DetailRow,
    ItemStatusBadge,
    Icon,
    Button,
    Input,
} from "@/components";
import { Company } from "@/types";
import { formatDateTime } from "@/utils";
import { useModal } from "@/stores/modal/use-modal-store";
import { useCompanyActions } from "@/hooks/company";

export function CompanyDetailsModal() {
    const { open, modalData, closeModal } = useModal();
    const company = modalData["view-company-details"] as Company | undefined;
    const { assignAffiliateCodeAsync, isAssigningAffiliate } = useCompanyActions();
    const [affiliateCode, setAffiliateCode] = useState("");

    useEffect(() => {
        setAffiliateCode(company?.affiliateCode ?? "");
    }, [company?.id, company?.affiliateCode]);

    if (!open["view-company-details"] || !company) return null;

    const handleCloseModal = () => {
        closeModal("view-company-details");
    };

    const handleSaveAffiliate = async () => {
        const next = affiliateCode.trim();
        await assignAffiliateCodeAsync(company.id, next === "" ? null : next);
    };

    const handleRemoveAffiliate = async () => {
        setAffiliateCode("");
        await assignAffiliateCodeAsync(company.id, null);
    };

    const currentCode = company.affiliateCode?.trim() || null;
    const hasChanges =
        (affiliateCode.trim() || null) !== (currentCode || null);

    return (
        <GlobalModal
            id="view-company-details"
            title="Detalhes da Empresa"
            size="xl"
            footer={
                <div className="flex justify-end">
                    <Button variant="outline" onClick={handleCloseModal}>
                        Fechar
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                        {company.logo ? (
                            <img src={company.logo} alt={company.name} className="size-16 rounded-lg object-contain border bg-white" />
                        ) : (
                            <div className="size-16 rounded-lg bg-muted flex items-center justify-center border">
                                <Icon name="Building" className="size-8 text-muted-foreground" />
                            </div>
                        )}
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold">{company.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Icon name="Fingerprint" className="size-3" />
                                {company.id}
                            </p>
                        </div>
                    </div>
                    <ItemStatusBadge status={company.isActive ? "ACTIVE" : "INACTIVE"} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2 text-primary uppercase tracking-wider">
                            <Icon name="Contact" className="size-4" />
                            Contacto e Legal
                        </h4>
                        <div className="space-y-2 p-4 rounded-xl border bg-muted/20">
                            <DetailRow label="Email" value={company.email} />
                            <DetailRow label="Telefone" value={company.phone} />
                            <DetailRow label="NIF" value={company.taxNumber?.toString()} />
                            <DetailRow label="Website" value={company.website || "N/A"} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2 text-primary uppercase tracking-wider">
                            <Icon name="MapPin" className="size-4" />
                            Localização e Datas
                        </h4>
                        <div className="space-y-2 p-4 rounded-xl border bg-muted/20">
                            <DetailRow label="Endereço" value={company.address || "N/A"} />
                            <DetailRow label="Criado em" value={formatDateTime(company.createdAt)} />
                            <DetailRow label="Atualizado em" value={formatDateTime(company.updatedAt)} />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2 text-primary uppercase tracking-wider">
                        <Icon name="Handshake" className="size-4" />
                        Afiliado
                    </h4>
                    <div className="space-y-4 p-4 rounded-xl border bg-muted/20">
                        <DetailRow
                            label="Código actual"
                            value={currentCode || "Sem código"}
                        />
                        <div className="space-y-3">
                            <Input
                                label="Código de afiliado"
                                placeholder="Ex: MWD-AO-1234"
                                value={affiliateCode}
                                onChange={(e) => setAffiliateCode(e.target.value)}
                                startIcon="Tag"
                                disabled={isAssigningAffiliate}
                            />
                            <div className="flex flex-wrap gap-2 justify-end">
                                {currentCode && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isAssigningAffiliate}
                                        onClick={handleRemoveAffiliate}
                                    >
                                        Remover
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    disabled={isAssigningAffiliate || !hasChanges}
                                    onClick={handleSaveAffiliate}
                                >
                                    {isAssigningAffiliate ? "A guardar..." : "Guardar código"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {company.stores && company.stores.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2 text-primary uppercase tracking-wider">
                            <Icon name="Store" className="size-4" />
                            Lojas ({company.stores.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {company.stores.map((store) => (
                                <div key={store.id} className="p-3 rounded-lg border bg-muted/10 flex flex-col gap-1">
                                    <span className="font-medium text-sm">{store.name}</span>
                                    <span className="text-xs text-muted-foreground">ID: {store.id}</span>
                                    {store.categories && store.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {store.categories.map(cat => (
                                                <span key={cat.id} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                                    {cat.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </GlobalModal>
    );
}
