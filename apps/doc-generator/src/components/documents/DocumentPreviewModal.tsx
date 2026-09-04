"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  ButtonSubmit,
  Badge,
} from "@workspace/ui";
import { Icon } from "@workspace/ui";
import { documentsService, DocumentItem } from "@/services/documents-service";
import { GenerationStatusBadge } from "./GenerationStatusBadge";
import { toast } from "sonner";

interface Props {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function DocumentPreviewModal({
  document,
  isOpen,
  onClose,
  onUpdated,
}: Props) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"details" | "pdf">("details");

  const generateMutation = useMutation({
    mutationFn: (docId: string) => documentsService.triggerGeneration(docId),
    onSuccess: () => {
      toast.success("Geração iniciada! O PDF está a ser renderizado em background.");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      onUpdated();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Erro ao iniciar geração de PDF.");
    },
  });

  if (!document) return null;

  const totalValue = (document.priceItems || []).reduce(
    (acc, it) => acc + Number(it.valueKz || 0),
    0
  );

  const formatKwanza = (value: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header Bar */}
        <div className="p-6 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-medium text-muted-foreground">
                {document.code}
              </span>
              <GenerationStatusBadge status={document.status} />
            </div>
            <DialogTitle className="text-xl font-semibold text-foreground mt-1">
              {document.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Cliente: <strong className="text-foreground">{document.client?.name || "Consumidor"}</strong> (NIF: {document.client?.nif || "N/A"})
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {document.status === "GENERATED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(documentsService.getDirectPdfUrl(document.id), "_blank")
                }
                className="gap-1.5 text-xs h-9 cursor-pointer"
              >
                <Icon name="Download" size={14} />
                <span>Descarregar PDF</span>
              </Button>
            )}

            <Button
              disabled={generateMutation.isPending}
              onClick={() => generateMutation.mutate(document.id)}
              className="gap-1.5 text-xs h-9 cursor-pointer"
            >
              <Icon name="Sparkles" size={14} />
              <span>Gerar / Atualizar PDF</span>
            </Button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center border-b px-6 bg-card text-xs font-medium">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-3 px-4 border-b-2 font-semibold transition-colors cursor-pointer ${
              activeTab === "details"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Detalhes da Proposta & Orçamento
          </button>
          <button
            onClick={() => setActiveTab("pdf")}
            className={`py-3 px-4 border-b-2 font-semibold transition-colors cursor-pointer ${
              activeTab === "pdf"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Visualizador de PDF
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "details" ? (
            <div className="space-y-6">
              {/* Notes */}
              {document.notes && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Notas & Condições Especiais
                  </h4>
                  <div className="p-4 rounded-xl border bg-muted/20 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {document.notes}
                  </div>
                </div>
              )}

              {/* Price Items */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Itens e Orçamentação
                </h4>
                <div className="overflow-x-auto rounded-xl border bg-card">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-b text-muted-foreground font-medium uppercase">
                      <tr>
                        <th className="p-3">Fase / Entregável</th>
                        <th className="p-3 w-20 text-center">Dias</th>
                        <th className="p-3 w-40 text-right">Subtotal (Kz)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(document.priceItems || []).map((it, idx) => (
                        <tr key={idx} className="hover:bg-muted/10">
                          <td className="p-3">
                            <p className="font-medium text-foreground">{it.phaseName}</p>
                            <span className="text-[11px] text-muted-foreground">{it.deliverable}</span>
                          </td>
                          <td className="p-3 text-center text-muted-foreground">
                            {it.days} dias
                          </td>
                          <td className="p-3 text-right font-mono font-medium text-foreground">
                            {formatKwanza(Number(it.valueKz || 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/20 font-semibold border-t">
                      <tr>
                        <td colSpan={2} className="p-3 text-right text-muted-foreground">
                          Total Geral:
                        </td>
                        <td className="p-3 text-right font-mono text-primary text-sm font-semibold">
                          {formatKwanza(totalValue)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Milestones */}
              {document.milestones && document.milestones.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Marcos de Faturação
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {document.milestones.map((m, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border bg-card space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs text-foreground">
                            {m.name}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {m.percentage}%
                          </Badge>
                        </div>
                        <p className="text-sm font-mono font-semibold text-primary">
                          {formatKwanza(Number(m.calculatedKz || 0))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[500px] w-full flex items-center justify-center rounded-xl border bg-muted/30">
              {document.status === "GENERATED" ? (
                <iframe
                  src={documentsService.getDirectPdfUrl(document.id)}
                  className="w-full h-full rounded-xl"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-center p-6">
                  <Icon name="FileText" size={40} className="text-muted-foreground/40" />
                  <div>
                    <h5 className="font-semibold text-sm text-foreground">
                      Nenhum PDF gerado para esta proposta
                    </h5>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                      Clique no botão &ldquo;Gerar / Atualizar PDF&rdquo; no topo para renderizar o documento oficial.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
