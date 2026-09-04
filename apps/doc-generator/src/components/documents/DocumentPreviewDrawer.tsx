"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  ButtonSubmit,
  Input,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from "@workspace/ui";
import { DynamicDrawer } from "@workspace/ui";
import { Icon } from "@workspace/ui";
import {
  documentsService,
  DocumentItem,
  PriceItem,
} from "@/services/documents-service";
import { clientsService, Client } from "@/services/clients-service";
import { clausesService, Clause } from "@/services/clauses-service";
import { GenerationStatusBadge } from "./GenerationStatusBadge";
import { toast } from "sonner";

interface Props {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function DocumentPreviewDrawer({
  document,
  isOpen,
  onClose,
  onUpdated,
}: Props) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"edit" | "pdf">("pdf");

  // Estados de edição do documento completo
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientNif, setClientNif] = useState("");
  const [validityDays, setValidityDays] = useState(30);
  const [deliveryDays, setDeliveryDays] = useState(45);
  const [notes, setNotes] = useState("");
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [clauseSearch, setClauseSearch] = useState("");
  const [clauseCategoryFilter, setClauseCategoryFilter] = useState("ALL");
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);

  // Sincronizar dados quando o documento selecionado mudar
  useEffect(() => {
    if (document) {
      setTitle(document.title || "");
      setClientName(document.client?.name || "");
      setClientNif(document.client?.nif || "");
      setValidityDays(document.validityDays ?? 30);
      setDeliveryDays(document.deliveryDays ?? 45);
      setNotes(document.notes || "");
      setSelectedClauses((document.clauses || []).map((c) => c.clause.id));
      setPriceItems(
        document.priceItems && document.priceItems.length > 0
          ? document.priceItems.map((p) => ({
              phaseName: p.phaseName,
              days: p.days,
              deliverable: p.deliverable,
              valueKz: Number(p.valueKz || 0),
            }))
          : [
              {
                phaseName: "Fase 1 - Entregável Principal",
                deliverable: "Desenvolvimento e implementação",
                days: 30,
                valueKz: 500000,
              },
            ]
      );
    }
  }, [document]);

  const { data: clausesData = [] } = useQuery({
    queryKey: ["clauses", "all"],
    queryFn: () => clausesService.getAllClauses(),
  });

  const clauses = Array.isArray(clausesData) ? clausesData : [];

  // Geração de PDF em background
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

  // Salvar alterações completas no documento
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!document) return;
      return documentsService.updateDocument(document.id, {
        title,
        clientName,
        clientNif,
        validityDays,
        deliveryDays,
        notes,
        clauseIds: selectedClauses,
        priceItems,
      });
    },
    onSuccess: () => {
      toast.success("Documento atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      onUpdated();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Erro ao salvar alterações no documento.");
    },
  });

  if (!document) return null;

  const totalValue = priceItems.reduce(
    (acc, it) => acc + Number(it.valueKz || 0),
    0
  );

  const formatKwanza = (value: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
    })
      .format(value)
      .replace("AOA", "Kz");
  };

  // Funções de manipulação de tabelas/preços
  const handleAddPriceItem = () => {
    setPriceItems((prev) => [
      ...prev,
      {
        phaseName: `Fase ${prev.length + 1}`,
        deliverable: "Novo entregável ou módulo adicional",
        days: 15,
        valueKz: 0,
      },
    ]);
  };

  const handleRemovePriceItem = (index: number) => {
    setPriceItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePriceItemChange = (
    index: number,
    field: keyof PriceItem,
    val: any
  ) => {
    setPriceItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  // Funções de manipulação de cláusulas / páginas contratuais
  const handleToggleClause = (id: string) => {
    setSelectedClauses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <DynamicDrawer
      open={isOpen}
      onOpenChange={(val) => !val && onClose()}
      side="right"
      className="sm:max-w-2xl md:max-w-4xl lg:max-w-5xl"
      title={`${document.code} - ${document.title}`}
      description={`Cliente: ${document.client?.tradeName || document.client?.name || "N/A"} (NIF: ${document.client?.nif || "N/A"})`}
    >
      <div className="flex flex-col h-full space-y-4">
        {/* Abas Superiores do Drawer */}
        <div className="flex items-center border-b border-border bg-card text-xs font-medium -mx-6 -mt-6 px-6 pt-2">
          <button
            onClick={() => setActiveTab("pdf")}
            className={`py-3 px-4 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "pdf"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon name="FileText" size={14} />
            <span>PDF Renderizado em Tempo Real</span>
          </button>

          <button
            onClick={() => setActiveTab("edit")}
            className={`py-3 px-4 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "edit"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon name="Pencil" size={14} />
            <span>Editar Conteúdo & Tabelas</span>
          </button>
        </div>

        {/* ========================================================
            ABA: FORMULÁRIO DE EDIÇÃO COMPLETA
            ======================================================== */}
        {activeTab === "edit" && (
          <div className="space-y-6 pt-2">
            {/* INFORMAÇÕES BÁSICAS */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Icon name="FilePenLine" size={16} className="text-primary" />
                  Identificação da Proposta & Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Título / Objecto da Proposta *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título da proposta..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Cliente / Entidade *
                    </label>
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Nome do cliente destinatário..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      NIF do Cliente
                    </label>
                    <Input
                      value={clientNif}
                      onChange={(e) => setClientNif(e.target.value)}
                      placeholder="NIF do cliente..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Validade da Proposta (dias)
                    </label>
                    <Input
                      type="number"
                      value={validityDays}
                      onChange={(e) => setValidityDays(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Prazo Global de Entrega (dias)
                    </label>
                    <Input
                      type="number"
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TABELA DE FASES / ENTREGÁVEIS (Adicionar/Remover Linhas) */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Icon name="Table" size={16} className="text-primary" />
                    Tabela Orçamental e Entregáveis
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Adicione, altere ou remova fases de trabalho e valores correspondentes.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddPriceItem}
                  className="gap-1 text-xs h-8 cursor-pointer"
                >
                  <Icon name="Plus" size={14} />
                  <span>Adicionar Linha</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {priceItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl border border-border/70 bg-card space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <span className="size-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-foreground">
                          {index + 1}
                        </span>
                        Fase / Módulo {index + 1}
                      </span>
                      {priceItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePriceItem(index)}
                          className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Remover linha"
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-6 space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          Nome da Fase
                        </label>
                        <Input
                          placeholder="Ex: Fase 1 - Levantamento..."
                          value={item.phaseName}
                          onChange={(e) =>
                            handlePriceItemChange(index, "phaseName", e.target.value)
                          }
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          Dias
                        </label>
                        <Input
                          type="number"
                          value={item.days}
                          onChange={(e) =>
                            handlePriceItemChange(index, "days", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          Subtotal (Kz)
                        </label>
                        <Input
                          type="number"
                          value={item.valueKz}
                          onChange={(e) =>
                            handlePriceItemChange(index, "valueKz", Number(e.target.value))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Entregável detalhado
                      </label>
                      <Input
                        placeholder="Ex: Entrega do protótipo navegável..."
                        value={item.deliverable}
                        onChange={(e) =>
                          handlePriceItemChange(index, "deliverable", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}

                <div className="p-3 rounded-lg bg-muted/20 flex items-center justify-between border">
                  <span className="text-xs text-muted-foreground font-medium">
                    Total Orçamental Actualizado:
                  </span>
                  <span className="text-sm font-mono font-semibold text-primary">
                    {formatKwanza(totalValue)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* PÁGINAS DE CLÁUSULAS / TERMOS (Adicionar/Remover Seções) */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Icon name="FileSpreadsheet" size={16} className="text-primary" />
                      Cláusulas & Condições Contratuais
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {selectedClauses.length} seleccionadas
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedClauses(clauses.map((c) => c.id));
                        toast.success("Todas as cláusulas seleccionadas!");
                      }}
                      className="h-6 text-[10px] px-2 cursor-pointer"
                    >
                      Todas ({clauses.length})
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedClauses([]);
                        toast.info("Seleção de cláusulas limpa.");
                      }}
                      className="h-6 text-[10px] px-1.5 text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      Limpar
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Termos contratuais da legislação angolana incluídos na secção final do PDF
                </p>

                {/* Filtro e Pesquisa */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2">
                  <div className="sm:col-span-7">
                    <Input
                      placeholder="Pesquisar cláusulas..."
                      value={clauseSearch}
                      onChange={(e) => setClauseSearch(e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <select
                      className="w-full h-7 px-2 text-[11px] rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      value={clauseCategoryFilter}
                      onChange={(e) => setClauseCategoryFilter(e.target.value)}
                    >
                      <option value="ALL">Todas as Categorias</option>
                      {Array.from(
                        new Set(clauses.map((c) => c.category?.name || "Geral"))
                      ).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {clauses
                  .filter((c) => {
                    const catName = c.category?.name || "Geral";
                    const matchesCat =
                      clauseCategoryFilter === "ALL" || catName === clauseCategoryFilter;
                    const term = clauseSearch.toLowerCase();
                    const matchesSearch =
                      c.title.toLowerCase().includes(term) ||
                      c.contentMarkdown.toLowerCase().includes(term) ||
                      catName.toLowerCase().includes(term);
                    return matchesCat && matchesSearch;
                  })
                  .map((clause) => {
                    const isChecked = selectedClauses.includes(clause.id);
                    return (
                      <div
                        key={clause.id}
                        onClick={() => handleToggleClause(clause.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                          isChecked
                            ? "border-primary bg-primary/5 text-foreground shadow-xs"
                            : "border-border/60 hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <div
                          className={`size-4 mt-0.5 rounded border flex items-center justify-center shrink-0 ${
                            isChecked
                              ? "bg-primary border-primary text-white"
                              : "border-muted-foreground"
                          }`}
                        >
                          {isChecked && <Icon name="Check" size={10} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-medium text-foreground truncate">{clause.title}</p>
                            <Badge variant={isChecked ? "default" : "outline"} className="text-[9px] shrink-0">
                              {isChecked ? "Incluída no PDF" : "Omitida"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-primary/80 font-medium">
                              {clause.category?.name || "Geral"}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                            {clause.contentMarkdown}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>

            {/* Observações / Notas */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Icon name="MessageSquare" size={16} className="text-primary" />
                  Notas & Condições Especiais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  rows={3}
                  className="w-full p-3 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-relaxed"
                  placeholder="Informações adicionais a incluir no final da proposta..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Barra de Acções do Drawer */}
            <div className="sticky bottom-0 bg-background/95 backdrop-blur-xs py-3 border-t border-border flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setActiveTab("pdf")}>
                Cancelar
              </Button>
              <Button
                
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate()}
                className="gap-1.5 text-xs cursor-pointer shadow-xs"
              >
                <Icon name="Save" size={14} />
                <span>Salvar Alterações no Documento</span>
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 3: VISUALIZADOR DE PDF EM TEMPO REAL (SEM STORAGE)
            ======================================================== */}
        {activeTab === "pdf" && (
          <div className="h-[680px] w-full flex flex-col rounded-xl border bg-muted/10 mt-2 overflow-hidden">
            <div className="px-4 py-2 bg-card border-b flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <Icon name="FileText" size={14} className="text-primary" />
                Renderizado em tempo real pelo motor da API (Playwright A4)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(documentsService.getDirectPdfUrl(document.id), "_blank")
                }
                className="h-7 text-xs gap-1 cursor-pointer"
              >
                <Icon name="ExternalLink" size={12} />
                <span>Abrir em Nova Aba</span>
              </Button>
            </div>
            <iframe
              src={documentsService.getDirectPdfUrl(document.id)}
              className="w-full flex-1 border-0"
              title="PDF Real-Time Preview"
            />
          </div>
        )}
      </div>
    </DynamicDrawer>
  );
}
