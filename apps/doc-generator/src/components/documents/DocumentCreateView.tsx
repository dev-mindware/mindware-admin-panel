"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PageWrapper,
  TitleList,
} from "@workspace/ui";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  ButtonSubmit,
  Input,
  Separator,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui";
import { Icon } from "@workspace/ui";
import { clausesService, Clause } from "@/services/clauses-service";
import { documentsService, PriceItem } from "@/services/documents-service";
import { DocumentTypeConfig } from "@/constants/document-types";
import { toast } from "sonner";

export type CustomPageBlockType = "PARAGRAPH" | "TABLE" | "SCOPE_LIST" | "NOTE";

export interface CustomPageTableBlock {
  id: string;
  type: "TABLE";
  headers: string[];
  rows: string[][];
}

export interface CustomPageParagraphBlock {
  id: string;
  type: "PARAGRAPH";
  content: string;
}

export interface CustomPageNoteBlock {
  id: string;
  type: "NOTE";
  title?: string;
  content: string;
}

export interface CustomPageScopeListBlock {
  id: string;
  type: "SCOPE_LIST";
  title: string;
  pointsText: string;
}

export type CustomPageBlock =
  | CustomPageParagraphBlock
  | CustomPageTableBlock
  | CustomPageNoteBlock
  | CustomPageScopeListBlock;

export interface CustomPageItem {
  id: string;
  title: string;
  placement?: "START" | "MIDDLE" | "END";
  content?: string;
  blocks: CustomPageBlock[];
}

export interface ScopeCardItem {
  id: string;
  title: string;
  pointsText: string; // Cada linha vira um ponto <li> no PDF
}

interface DocumentCreateViewProps {
  typeConfig: DocumentTypeConfig;
}

const MAX_SCOPE_ITEMS = 6;
const MAX_SCOPE_TITLE_LENGTH = 35;
const MAX_SCOPE_POINTS = 6;
const MAX_POINT_LENGTH = 100;

export function DocumentCreateView({ typeConfig }: DocumentCreateViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"form" | "pdf">("form");

  // Código automático
  const [code, setCode] = useState(
    `${typeConfig.prefix}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [title, setTitle] = useState("");

  // Dados do Cliente directos (sem base de dados separada)
  const [clientName, setClientName] = useState("");
  const [clientNif, setClientNif] = useState("");

  const [validityDays, setValidityDays] = useState(30);
  const [deliveryDays, setDeliveryDays] = useState(typeConfig.defaultDeliverableDays || 30);
  const [notes, setNotes] = useState("");
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [clauseSearch, setClauseSearch] = useState("");
  const [clauseCategoryFilter, setClauseCategoryFilter] = useState("ALL");

  // Tabela de itens/fases
  const [priceItems, setPriceItems] = useState<PriceItem[]>([
    {
      phaseName: `${typeConfig.name} - Fase 1`,
      deliverable: "Elaboração e entrega dos serviços acordados",
      days: typeConfig.defaultDeliverableDays || 15,
      valueKz: 500000,
    },
  ]);

  // Controlo e Customização de Páginas & Secções
  const [showIntro, setShowIntro] = useState(true);
  const [introText, setIntroText] = useState("");
  const [objectivesText, setObjectivesText] = useState("");

  // Escopo do Projecto: Módulos com Título e Lista de Pontos
  const [showScope, setShowScope] = useState(true);
  const [scopeItems, setScopeItems] = useState<ScopeCardItem[]>([
    {
      id: "scope-1",
      title: "PORTAL INTERNO & CONTEÚDOS",
      pointsText: "Página inicial e comunicados\nContactos e avisos corporativos\nFAQ e políticas institucionais",
    },
    {
      id: "scope-2",
      title: "ÁREA DO COLABORADOR",
      pointsText: "Perfil individual e dados funcionais\nHistórico de solicitações e documentos\nNotificações de estado em tempo real",
    },
    {
      id: "scope-3",
      title: "GESTÃO DE DECLARAÇÕES",
      pointsText: "Submissão de pedidos com formulários guiados\nFluxo de aprovação multinível\nEmissão de comprovativos em PDF",
    },
    {
      id: "scope-4",
      title: "PAINEL ADMINISTRATIVO",
      pointsText: "Gestão de utilizadores e perfis de acesso\nRelatórios gerenciais e tempos de resposta\nParametrização do sistema e auditoria",
    },
  ]);

  const [showConditions, setShowConditions] = useState(true);

  // Páginas personalizadas adicionais
  const [customPages, setCustomPages] = useState<CustomPageItem[]>([]);
  const [newPagePosition, setNewPagePosition] = useState<string>("last");

  const getOrdinalText = (num: number, total?: number) => {
    if (num === 1) return "1ª - Primeira Página";
    if (num === 2) return "2ª - Segunda Página";
    if (num === 3) return "3ª - Terceira Página";
    if (num === 4) return "4ª - Quarta Página";
    if (num === 5) return "5ª - Quinta Página";
    if (num === 6) return "6ª - Sexta Página";
    if (num === 7) return "7ª - Sétima Página";
    if (num === 8) return "8ª - Oitava Página";
    if (num === 9) return "9ª - Nona Página";
    if (num === 10) return "10ª - Décima Página";
    return `${num}ª Página`;
  };

  // Preview em Tempo Real do PDF (Blob URL)
  const [livePdfUrl, setLivePdfUrl] = useState<string | null>(null);
  const [isRenderingLivePdf, setIsRenderingLivePdf] = useState(false);
  const [createdDocumentId, setCreatedDocumentId] = useState<string | null>(null);
  const livePdfBlobRef = useRef<string | null>(null);

  const { data: clausesData = [] } = useQuery({
    queryKey: ["clauses", "all"],
    queryFn: () => clausesService.getAllClauses(),
  });

  const clauses = Array.isArray(clausesData) ? clausesData : [];

  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: () => documentsService.getTemplates(),
  });

  // Auto-selecionar cláusulas essenciais recomendadas se nenhuma estiver selecionada
  useEffect(() => {
    if (clauses.length > 0 && selectedClauses.length === 0) {
      const recommendedKeywords = [
        "22/11", // Protecção de dados
        "7/17",  // Segurança das Redes
        "15/14", // Propriedade Intelectual
        "26/20", // Retenção na fonte
        "7/19",  // IVA
        "Garantia",
        "Confidencialidade",
        "Força Maior",
        "Validade",
      ];
      const defaultIds = clauses
        .filter((c) =>
          recommendedKeywords.some((kw) => c.title.includes(kw))
        )
        .map((c) => c.id);
      if (defaultIds.length > 0) {
        setSelectedClauses(defaultIds);
      }
    }
  }, [clauses]);

  // Limpar ObjectURL ao desmontar
  useEffect(() => {
    return () => {
      if (livePdfBlobRef.current) {
        URL.revokeObjectURL(livePdfBlobRef.current);
      }
    };
  }, []);

  const totalValue = priceItems.reduce(
    (acc, it) => acc + Number(it.valueKz || 0),
    0
  );

  const totalDays = priceItems.reduce(
    (acc, it) => acc + Number(it.days || 0),
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

  // Manipulação de Linhas da Tabela
  const handleAddPriceItem = () => {
    setPriceItems((prev) => [
      ...prev,
      {
        phaseName: `Fase ${prev.length + 1}`,
        deliverable: "Descrição da entrega",
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
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  // Manipulação dos Módulos de Escopo
  const handleAddScopeItem = () => {
    if (scopeItems.length >= MAX_SCOPE_ITEMS) {
      toast.warning(
        `Limite de ${MAX_SCOPE_ITEMS} escopos atingido para preservar a formatação perfeita do PDF sem distorção.`
      );
      return;
    }
    setScopeItems((prev) => [
      ...prev,
      {
        id: `scope-${Date.now()}`,
        title: `NOVO MÓDULO ${prev.length + 1}`,
        pointsText: "Ponto descritivo 1\nPonto descritivo 2\nPonto descritivo 3",
      },
    ]);
  };

  const handleRemoveScopeItem = (id: string) => {
    setScopeItems((prev) => prev.filter((s) => s.id !== id));
  };

  const handleScopeChange = (
    id: string,
    field: "title" | "pointsText",
    value: string
  ) => {
    setScopeItems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // Manipulação de Páginas Customizadas
  const handleAddCustomPage = (targetPos?: string) => {
    const pos = targetPos || newPagePosition;

    setCustomPages((prev) => {
      let insertIndex = prev.length; // padrão: última
      if (pos === "first" || pos === "1") {
        insertIndex = 0;
      } else if (pos === "last") {
        insertIndex = prev.length;
      } else {
        const parsed = parseInt(pos, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= prev.length + 1) {
          insertIndex = parsed - 1;
        }
      }

      const newPage: CustomPageItem = {
        id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `PÁGINA ADICIONAL ${insertIndex + 1}`,
        placement: "MIDDLE",
        blocks: [
          {
            id: `b-${Date.now()}-1`,
            type: "PARAGRAPH",
            content: "Insira aqui a contextualização descritiva desta seção técnica...",
          },
        ],
      };

      const updated = [...prev];
      updated.splice(insertIndex, 0, newPage);
      return updated;
    });

    toast.success("Nova página adicionada com sucesso!");
  };

  const handleMoveCustomPage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= customPages.length || fromIndex === toIndex) return;
    setCustomPages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleCustomPagePlacementChange = (
    id: string,
    placement: "START" | "MIDDLE" | "END"
  ) => {
    setCustomPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, placement } : p))
    );
  };

  const handleRemoveCustomPage = (id: string) => {
    setCustomPages((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCustomPageTitleChange = (id: string, title: string) => {
    setCustomPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title } : p))
    );
  };

  // Funções de Manipulação de Blocos Dentro de Cada Página
  const handleAddBlock = (pageId: string, type: CustomPageBlockType) => {
    setCustomPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        let newBlock: CustomPageBlock;
        if (type === "PARAGRAPH") {
          newBlock = {
            id: `b-${Date.now()}`,
            type: "PARAGRAPH",
            content: "Texto descritivo do parágrafo...",
          };
        } else if (type === "NOTE") {
          newBlock = {
            id: `b-${Date.now()}`,
            type: "NOTE",
            title: "Nota Importante",
            content: "Condição ou aviso técnico relevante sobre esta seção.",
          };
        } else if (type === "SCOPE_LIST") {
          newBlock = {
            id: `b-${Date.now()}`,
            type: "SCOPE_LIST",
            title: "REQUISITOS & ESPECIFICAÇÕES",
            pointsText: "Ponto detalhado 1\nPonto detalhado 2\nPonto detalhado 3",
          };
        } else {
          newBlock = {
            id: `b-${Date.now()}`,
            type: "TABLE",
            headers: ["Item / Especificação", "Descrição", "Nível / Estado"],
            rows: [
              ["Servidor Dedicado", "CPU 8 vCPU, 32GB RAM, SSD NVMe", "Recomendado"],
              ["Backup Automático", "Rotina diária incremental e semanal full", "Incluído"],
            ],
          };
        }
        return {
          ...p,
          blocks: [...p.blocks, newBlock],
        };
      })
    );
  };

  const handleRemoveBlock = (pageId: string, blockId: string) => {
    setCustomPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          blocks: p.blocks.filter((b) => b.id !== blockId),
        };
      })
    );
  };

  const handleUpdateParagraphBlock = (
    pageId: string,
    blockId: string,
    content: string
  ) => {
    setCustomPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          blocks: p.blocks.map((b) =>
            b.id === blockId && b.type === "PARAGRAPH" ? { ...b, content } : b
          ),
        };
      })
    );
  };

  const handleUpdateNoteBlock = (
    pageId: string,
    blockId: string,
    field: "title" | "content",
    val: string
  ) => {
    setCustomPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          blocks: p.blocks.map((b) =>
            b.id === blockId && b.type === "NOTE" ? { ...b, [field]: val } : b
          ),
        };
      })
    );
  };

  const handleUpdateScopeListBlock = (
    pageId: string,
    blockId: string,
    field: "title" | "pointsText",
    val: string
  ) => {
    setCustomPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          blocks: p.blocks.map((b) =>
            b.id === blockId && b.type === "SCOPE_LIST" ? { ...b, [field]: val } : b
          ),
        };
      })
    );
  };

  const handleUpdateTableHeader = (
    pageId: string,
    blockId: string,
    colIndex: number,
    val: string
  ) => {
    setCustomPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          blocks: p.blocks.map((b) => {
            if (b.id !== blockId || b.type !== "TABLE") return b;
            const newHeaders = [...b.headers];
            newHeaders[colIndex] = val;
            return { ...b, headers: newHeaders };
          }),
        };
      })
    );
  };

  const handleAddTableColumn = (pageId: string, blockId: string) => {
    setCustomPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          blocks: p.blocks.map((b) => {
            if (b.id !== blockId || b.type !== "TABLE") return b;
            const newHeaders = [...b.headers, `Coluna ${b.headers.length + 1}`];
            const newRows = b.rows.map((row) => [...row, "-"]);
            return { ...b, headers: newHeaders, rows: newRows };
          }),
        };
      })
    );
  };

  const handleRemoveTableColumn = (
    pageId: string,
    blockId: string,
    colIndex: number
  ) => {
    setCustomPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          blocks: p.blocks.map((b) => {
            if (b.id !== blockId || b.type !== "TABLE" || b.headers.length <= 1)
              return b;
            const newHeaders = b.headers.filter((_, idx) => idx !== colIndex);
            const newRows = b.rows.map((row) =>
              row.filter((_, idx) => idx !== colIndex)
            );
            return { ...b, headers: newHeaders, rows: newRows };
          }),
        };
      })
    );
  };

  const handleUpdateTableCell = (
    pageId: string,
    blockId: string,
    rowIndex: number,
    colIndex: number,
    val: string
  ) => {
    setCustomPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          blocks: p.blocks.map((b) => {
            if (b.id !== blockId || b.type !== "TABLE") return b;
            const newRows = b.rows.map((r, rIdx) => {
              if (rIdx !== rowIndex) return r;
              const newR = [...r];
              newR[colIndex] = val;
              return newR;
            });
            return { ...b, rows: newRows };
          }),
        };
      })
    );
  };

  const handleAddTableRow = (pageId: string, blockId: string) => {
    setCustomPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          blocks: p.blocks.map((b) => {
            if (b.id !== blockId || b.type !== "TABLE") return b;
            const newRow = new Array(b.headers.length).fill("Novo item");
            return { ...b, rows: [...b.rows, newRow] };
          }),
        };
      })
    );
  };

  const handleRemoveTableRow = (
    pageId: string,
    blockId: string,
    rowIndex: number
  ) => {
    setCustomPages((prev) =>
      prev.map((p) => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          blocks: p.blocks.map((b) => {
            if (b.id !== blockId || b.type !== "TABLE" || b.rows.length <= 1)
              return b;
            return {
              ...b,
              rows: b.rows.filter((_, idx) => idx !== rowIndex),
            };
          }),
        };
      })
    );
  };

  const handleToggleClause = (id: string) => {
    setSelectedClauses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Converter itens de escopo para array com pontos limpos
  const getProcessedScopeItems = () => {
    return scopeItems.map((item) => {
      const points = item.pointsText
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean)
        .slice(0, MAX_SCOPE_POINTS)
        .map((p) => (p.length > MAX_POINT_LENGTH ? `${p.substring(0, MAX_POINT_LENGTH)}...` : p));
      return {
        title: item.title.trim().toUpperCase().substring(0, MAX_SCOPE_TITLE_LENGTH),
        points,
      };
    });
  };

  // Formatar páginas customizadas para renderização (convertendo pointsText para array de pontos)
  const getProcessedCustomPages = () => {
    return customPages.map((page) => ({
      ...page,
      blocks: (page.blocks || []).map((b) => {
        if (b.type === "SCOPE_LIST") {
          return {
            ...b,
            points: b.pointsText
              .split("\n")
              .map((p) => p.trim())
              .filter(Boolean),
          };
        }
        return b;
      }),
    }));
  };

  // Gerar Preview em Tempo Real do PDF Antes de Salvar
  const generateLivePdf = async () => {
    setIsRenderingLivePdf(true);
    try {
      const defaultTemplateId = templates[0]?.id;
      const formattedScopeItems = getProcessedScopeItems();
      const formattedCustomPages = getProcessedCustomPages();

      const payload = {
        code,
        title: title.trim() || `${typeConfig.name} - ${code}`,
        clientName: clientName.trim() || "Cliente Destinatário",
        clientNif: clientNif.trim() || "Consumidor Final",
        client: {
          name: clientName.trim() || "Cliente Destinatário",
          tradeName: clientName.trim() || "Cliente Destinatário",
          nif: clientNif.trim() || "Consumidor Final",
          city: "Luanda",
          country: "Angola",
        },
        templateId: defaultTemplateId,
        validityDays,
        deliveryDays,
        notes,
        clauseIds: selectedClauses,
        priceItems,
        showIntro,
        introText,
        objectivesText,
        showScope,
        scopeItems: formattedScopeItems,
        customPages: formattedCustomPages,
        showConditions,
      };

      const blob = await documentsService.renderLivePdfBlob(payload);

      if (livePdfBlobRef.current) {
        URL.revokeObjectURL(livePdfBlobRef.current);
      }

      const blobUrl = URL.createObjectURL(blob);
      livePdfBlobRef.current = blobUrl;
      setLivePdfUrl(blobUrl);
      setActiveTab("pdf");
    } catch (err: any) {
      toast.error(
        err.message ||
          "Erro ao renderizar pré-visualização em tempo real do PDF."
      );
    } finally {
      setIsRenderingLivePdf(false);
    }
  };

  // Salvar e Emitir
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) {
        throw new Error(`Preencha o título do(a) ${typeConfig.name.toLowerCase()}.`);
      }
      if (!clientName.trim()) {
        throw new Error("Preencha o nome do cliente destinatário.");
      }
      if (priceItems.length === 0) {
        throw new Error("Adicione pelo menos um item à tabela orçamental.");
      }

      const defaultTemplateId = templates[0]?.id || "default";

      return documentsService.createDocument({
        code,
        title,
        clientName: clientName.trim(),
        clientNif: clientNif.trim() || "Consumidor Final",
        templateId: defaultTemplateId,
        validityDays,
        deliveryDays,
        notes,
        clauseIds: selectedClauses,
        priceItems,
      });
    },
    onSuccess: (res) => {
      toast.success(`${typeConfig.name} criado(a) e salvo(a) com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      if (res?.id) {
        setCreatedDocumentId(res.id);
        setActiveTab("pdf");
      } else {
        router.push(`/documents/${typeConfig.slug}`);
      }
    },
    onError: (err: any) => {
      toast.error(
        err.message ||
          err.response?.data?.message ||
          `Erro ao criar ${typeConfig.name.toLowerCase()}.`
      );
    },
  });

  return (
    <PageWrapper
      routePath={`/documents/${typeConfig.slug}`}
      routeLabel={typeConfig.pluralName}
      subRoute={`Novo(a) ${typeConfig.name}`}
      showSeparator={true}
    >
      <div className="space-y-6">
        {/* Cabeçalho minimalista com TitleList e Ações Rápidas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TitleList
            title={`Emitir Novo(a) ${typeConfig.name}`}
            suTitle="Ajuste escopos, tabelas, páginas e visualize o PDF oficial em tempo real antes de salvar"
          />

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/documents/${typeConfig.slug}`)}
              className="text-xs cursor-pointer"
            >
              Cancelar
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={generateLivePdf}
              disabled={isRenderingLivePdf}
              className="gap-1.5 text-xs cursor-pointer"
            >
              <Icon
                name={isRenderingLivePdf ? "LoaderCircle" : "FileText"}
                size={14}
                className={isRenderingLivePdf ? "animate-spin" : ""}
              />
              <span>{isRenderingLivePdf ? "Renderizando..." : "Visualizar PDF"}</span>
            </Button>

            <Button disabled={createMutation.isPending} onClick={() => createMutation.mutate()} className="gap-1.5 text-xs cursor-pointer shadow-xs">
              <Icon name="CircleCheck" size={14} />
              <span>Salvar e Emitir</span>
            </Button>
          </div>
        </div>

        {/* Abas de Navegação no Padrão Minimalista */}
        <div className="flex items-center border-b border-border bg-card text-xs font-medium px-4 pt-1 rounded-t-xl">
          <button
            onClick={() => setActiveTab("form")}
            className={`py-3 px-4 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "form"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon name="FilePenLine" size={14} />
            <span>Configuração, Escopos & Páginas</span>
          </button>

          <button
            onClick={() => {
              if (livePdfUrl || createdDocumentId) {
                setActiveTab("pdf");
              } else {
                generateLivePdf();
              }
            }}
            className={`py-3 px-4 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "pdf"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon name="FileText" size={14} />
            <span>
              PDF em Tempo Real{" "}
              {livePdfUrl && (
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  Visualização Activa
                </Badge>
              )}
            </span>
          </button>
        </div>

        {/* ========================================================
            ABA 1: CONFIGURAÇÃO COMPLETA (TOTALMENTE AJUSTÁVEL)
            ======================================================== */}
        {activeTab === "form" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Principal: Identificação, Escopos & Tabelas */}
            <div className="lg:col-span-2 space-y-6">
              {/* Identificação & Cliente */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Icon name={typeConfig.icon} size={16} className="text-primary" />
                        Identificação da Proposta & Cliente
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Defina o objecto, código e os dados da entidade destinatária
                      </CardDescription>
                    </div>
                    <span className="font-mono text-xs font-semibold text-primary px-2 py-0.5 rounded bg-primary/10">
                      {code}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Título / Objecto do(a) {typeConfig.name} *
                    </label>
                    <Input
                      placeholder={`Ex: Proposta para Desenvolvimento da Plataforma GCH...`}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Informação do Cliente Directa (Sem base de dados desnecessária) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">
                        Nome do Cliente / Entidade Destinatária *
                      </label>
                      <Input
                        placeholder="Ex: AIPEX Angola ou Empresa Exemplo, Lda"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">
                        NIF do Cliente (opcional)
                      </label>
                      <Input
                        placeholder="Ex: 5412345678"
                        value={clientNif}
                        onChange={(e) => setClientNif(e.target.value)}
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
                        Prazo de Execução (dias)
                      </label>
                      <Input
                        type="number"
                        value={deliveryDays}
                        onChange={(e) => setDeliveryDays(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Observações e Notas Contratuais
                    </label>
                    <textarea
                      rows={2}
                      className="w-full p-2.5 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-relaxed"
                      placeholder="Notas ou condições especiais a figurar na página financeira..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* ESCOPO DO PROJECTO: Módulos com Título e Lista de Pontos */}
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Icon name="LayoutGrid" size={16} className="text-primary" />
                        Escopos do Projecto (Módulos & Especificações)
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px]">
                        {scopeItems.length} / {MAX_SCOPE_ITEMS} Módulos
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-0.5">
                      Cada escopo possui um título e uma lista de pontos abaixo, alinhados em 2 colunas no PDF
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={showScope ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowScope(!showScope)}
                      className="h-8 text-xs cursor-pointer"
                    >
                      {showScope ? "Página Incluída" : "Página Omitida"}
                    </Button>

                    {showScope && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddScopeItem}
                        disabled={scopeItems.length >= MAX_SCOPE_ITEMS}
                        className="gap-1.5 text-xs h-8 cursor-pointer"
                      >
                        <Icon name="Plus" size={14} />
                        <span>Adicionar Escopo</span>
                      </Button>
                    )}
                  </div>
                </CardHeader>

                {showScope && (
                  <CardContent className="space-y-4">
                    <div className="p-2.5 rounded-lg bg-muted/20 border text-[11px] text-muted-foreground flex items-center gap-2">
                      <Icon name="Info" size={14} className="text-primary shrink-0" />
                      <span>
                        <strong>Dica de Alinhamento PDF:</strong> Escreva um título conciso (máx. {MAX_SCOPE_TITLE_LENGTH} caracteres) e digite um ponto por linha na caixa de texto (até {MAX_SCOPE_POINTS} pontos por módulo).
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {scopeItems.map((item, index) => {
                        const pointLines = item.pointsText.split("\n").filter((l) => l.trim().length > 0);
                        const isOverPoints = pointLines.length > MAX_SCOPE_POINTS;
                        const isOverTitle = item.title.length > MAX_SCOPE_TITLE_LENGTH;

                        return (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-xl border border-border/70 bg-card space-y-3 relative group shadow-xs"
                          >
                            <div className="flex items-center justify-between border-b border-border/50 pb-2">
                              <span className="text-xs font-semibold text-primary flex items-center gap-1.5 uppercase tracking-wide">
                                <span className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                  {index + 1}
                                </span>
                                Escopo #{index + 1}
                              </span>

                              {scopeItems.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveScopeItem(item.id)}
                                  className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                                  title="Remover módulo"
                                >
                                  <Icon name="Trash2" size={13} />
                                </Button>
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-medium text-foreground">
                                  Título do Escopo
                                </label>
                                <span
                                  className={`text-[10px] ${
                                    isOverTitle ? "text-destructive font-semibold" : "text-muted-foreground"
                                  }`}
                                >
                                  {item.title.length}/{MAX_SCOPE_TITLE_LENGTH}
                                </span>
                              </div>
                              <Input
                                placeholder="Ex: PORTAL INTERNO DO GCH"
                                value={item.title}
                                maxLength={MAX_SCOPE_TITLE_LENGTH}
                                onChange={(e) =>
                                  handleScopeChange(item.id, "title", e.target.value)
                                }
                                className="font-semibold uppercase tracking-wider text-xs"
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-medium text-foreground">
                                  Lista de Pontos (1 por linha)
                                </label>
                                <span
                                  className={`text-[10px] ${
                                    isOverPoints ? "text-destructive font-semibold" : "text-muted-foreground"
                                  }`}
                                >
                                  {pointLines.length}/{MAX_SCOPE_POINTS} pontos
                                </span>
                              </div>
                              <textarea
                                rows={4}
                                className="w-full p-2.5 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-relaxed font-sans"
                                placeholder={"Página inicial;\nSobre a plataforma;\nAvisos e comunicados..."}
                                value={item.pointsText}
                                onChange={(e) =>
                                  handleScopeChange(item.id, "pointsText", e.target.value)
                                }
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Tabela de Itens e Honorários (Adicionar e Remover Linhas) */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Icon name="Table" size={16} className="text-primary" />
                      Tabela Orçamental (Honorários & Entregáveis)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Etapas de trabalho, prazos parciais e valores correspondentes em Kwanzas
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPriceItem}
                    className="gap-1.5 text-xs h-8 cursor-pointer"
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
                            title="Remover etapa"
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6 space-y-1">
                          <label className="text-[11px] font-medium text-muted-foreground">
                            Nome da Fase / Módulo
                          </label>
                          <Input
                            placeholder="Ex: Fase 1 - Levantamento..."
                            value={item.phaseName}
                            onChange={(e) =>
                              handlePriceItemChange(index, "phaseName", e.target.value)
                            }
                            required
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
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          Descrição do Entregável
                        </label>
                        <Input
                          placeholder="Ex: Entrega do protótipo e documentação..."
                          value={item.deliverable}
                          onChange={(e) =>
                            handlePriceItemChange(index, "deliverable", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                  ))}

                  <div className="p-3 rounded-lg bg-muted/20 flex items-center justify-between border">
                    <span className="text-xs text-muted-foreground font-medium">
                      Total Orçamental:
                    </span>
                    <span className="text-sm font-mono font-semibold text-primary">
                      {formatKwanza(totalValue)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Especificações Adicionais: Introdução e Páginas Livres */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Icon name="Compass" size={16} className="text-primary" />
                        Introdução & Objectivos Gerais
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Configure ou omita a página inicial de introdução e objectivos
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant={showIntro ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowIntro(!showIntro)}
                      className="h-7 text-xs"
                    >
                      {showIntro ? "Incluída" : "Omitida"}
                    </Button>
                  </div>
                </CardHeader>
                {showIntro && (
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Texto de Introdução (opcional - deixe vazio para padrão)
                      </label>
                      <textarea
                        rows={3}
                        className="w-full p-2.5 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-relaxed"
                        placeholder="Deixe em branco para usar a introdução institucional padrão..."
                        value={introText}
                        onChange={(e) => setIntroText(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">
                        Objectivos Gerais (opcional - deixe vazio para padrão)
                      </label>
                      <textarea
                        rows={3}
                        className="w-full p-2.5 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-relaxed"
                        placeholder="Deixe em branco para usar a listagem de objectivos padrão..."
                        value={objectivesText}
                        onChange={(e) => setObjectivesText(e.target.value)}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Páginas Adicionais (Adicionar/Remover Páginas Livres) */}
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
                  <div>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Icon name="Files" size={16} className="text-primary" />
                      Páginas Adicionais Personalizadas
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Adicione páginas inteiras definindo a posição inicial (primeira, intermediária ou última)
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="text-[11px] font-medium hidden sm:inline">Inserir como:</span>
                      <Select
                        value={newPagePosition}
                        onValueChange={setNewPagePosition}
                      >
                        <SelectTrigger className="h-8 text-xs w-[145px] bg-background">
                          <SelectValue placeholder="Posição da página" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="first" className="text-xs">
                            1ª (Primeira Página)
                          </SelectItem>
                          {customPages.map((_, i) => {
                            if (i === 0) return null;
                            return (
                              <SelectItem key={i + 1} value={String(i + 1)} className="text-xs">
                                {i + 1}ª Página
                              </SelectItem>
                            );
                          })}
                          <SelectItem value="last" className="text-xs">
                            Última ({customPages.length + 1}ª Página)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddCustomPage()}
                      className="gap-1.5 text-xs h-8 cursor-pointer font-medium hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-colors"
                    >
                      <Icon name="Plus" size={14} />
                      <span>Adicionar Página</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {customPages.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed text-center text-xs text-muted-foreground">
                      Nenhuma página adicional configurada. Selecione a posição e clique em "Adicionar Página" para criar seções independentes no documento.
                    </div>
                  ) : (
                    customPages.map((page, index) => (
                      <div
                        key={page.id}
                        className="p-3.5 rounded-xl border border-border/70 bg-card space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold shrink-0">
                              {index + 1}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-foreground">
                                {getOrdinalText(index + 1, customPages.length)}
                              </span>
                              {index === 0 && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4.5 bg-background font-normal text-muted-foreground">
                                  Primeira
                                </Badge>
                              )}
                              {index === customPages.length - 1 && customPages.length > 1 && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4.5 bg-background font-normal text-muted-foreground">
                                  Última
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Seletor de localização no documento PDF */}
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mr-1">
                              <span className="hidden md:inline text-[10px]">Posição no PDF:</span>
                              <Select
                                value={page.placement || "MIDDLE"}
                                onValueChange={(val: "START" | "MIDDLE" | "END") =>
                                  handleCustomPagePlacementChange(page.id, val)
                                }
                              >
                                <SelectTrigger className="h-6.5 text-[10px] px-2 min-w-[130px] bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="START" className="text-[11px]">
                                    Início (após Capa)
                                  </SelectItem>
                                  <SelectItem value="MIDDLE" className="text-[11px]">
                                    Meio (após Escopo)
                                  </SelectItem>
                                  <SelectItem value="END" className="text-[11px]">
                                    Fim (última do PDF)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Dropdown de Mudar de Posição / Número */}
                            {customPages.length > 1 && (
                              <div className="flex items-center gap-1">
                                <Select
                                  value={String(index + 1)}
                                  onValueChange={(val) => {
                                    const target = parseInt(val, 10) - 1;
                                    handleMoveCustomPage(index, target);
                                  }}
                                >
                                  <SelectTrigger className="h-6.5 text-[10px] px-2 w-[90px] bg-background">
                                    <SelectValue placeholder="Mover..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {customPages.map((_, i) => (
                                      <SelectItem key={i} value={String(i + 1)} className="text-[11px]">
                                        {i === 0 ? "1ª (Primeira)" : i === customPages.length - 1 ? `${i + 1}ª (Última)` : `${i + 1}ª Página`}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                {/* Botão Subir */}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={index === 0}
                                  onClick={() => handleMoveCustomPage(index, index - 1)}
                                  className="h-6.5 w-6.5 p-0 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30"
                                  title="Mover para cima"
                                >
                                  <Icon name="ArrowUp" size={12} />
                                </Button>

                                {/* Botão Descer */}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={index === customPages.length - 1}
                                  onClick={() => handleMoveCustomPage(index, index + 1)}
                                  className="h-6.5 w-6.5 p-0 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30"
                                  title="Mover para baixo"
                                >
                                  <Icon name="ArrowDown" size={12} />
                                </Button>
                              </div>
                            )}

                            {/* Excluir Página */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveCustomPage(page.id)}
                              className="h-6.5 w-6.5 p-0 text-destructive hover:bg-destructive/10 cursor-pointer ml-1"
                              title="Excluir página"
                            >
                              <Icon name="Trash2" size={13} />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-muted-foreground">
                            Título da Página
                          </label>
                          <Input
                            placeholder="Ex: Metodologia de Trabalho, SLA & Infraestrutura..."
                            value={page.title}
                            onChange={(e) =>
                              handleCustomPageTitleChange(page.id, e.target.value)
                            }
                            className="font-semibold text-xs uppercase"
                          />
                        </div>

                        {/* Blocos de Conteúdo Dinâmicos */}
                        <div className="space-y-3 pt-2">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
                            <span className="text-[11px] font-medium text-foreground flex items-center gap-1.5">
                              <Icon name="Layers" size={13} className="text-primary" />
                              Blocos de Conteúdo ({page.blocks.length})
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddBlock(page.id, "PARAGRAPH")}
                                className="h-6 text-[10px] px-2 gap-1 cursor-pointer"
                              >
                                <Icon name="Type" size={11} />
                                <span>+ Parágrafo</span>
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddBlock(page.id, "TABLE")}
                                className="h-6 text-[10px] px-2 gap-1 cursor-pointer"
                              >
                                <Icon name="Table" size={11} />
                                <span>+ Tabela</span>
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddBlock(page.id, "SCOPE_LIST")}
                                className="h-6 text-[10px] px-2 gap-1 cursor-pointer"
                              >
                                <Icon name="List" size={11} />
                                <span>+ Lista</span>
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddBlock(page.id, "NOTE")}
                                className="h-6 text-[10px] px-2 gap-1 cursor-pointer"
                              >
                                <Icon name="StickyNote" size={11} />
                                <span>+ Nota</span>
                              </Button>
                            </div>
                          </div>

                          {page.blocks.length === 0 ? (
                            <div className="p-3 rounded-lg border border-dashed text-center text-[11px] text-muted-foreground">
                              Nenhum bloco adicionado. Use os botões acima para adicionar parágrafos, tabelas, listas ou notas.
                            </div>
                          ) : (
                            page.blocks.map((block, bIdx) => (
                              <div
                                key={block.id}
                                className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2.5 relative group"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                                    {block.type === "PARAGRAPH" && <Icon name="Type" size={12} />}
                                    {block.type === "TABLE" && <Icon name="Table" size={12} />}
                                    {block.type === "SCOPE_LIST" && <Icon name="List" size={12} />}
                                    {block.type === "NOTE" && <Icon name="StickyNote" size={12} />}
                                    {block.type === "PARAGRAPH" && `Bloco ${bIdx + 1}: Parágrafo`}
                                    {block.type === "TABLE" && `Bloco ${bIdx + 1}: Tabela Customizada`}
                                    {block.type === "SCOPE_LIST" && `Bloco ${bIdx + 1}: Lista com Marcadores`}
                                    {block.type === "NOTE" && `Bloco ${bIdx + 1}: Caixa de Destaque / Nota`}
                                  </span>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveBlock(page.id, block.id)}
                                    className="h-5 w-5 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                                    title="Remover bloco"
                                  >
                                    <Icon name="Trash2" size={12} />
                                  </Button>
                                </div>

                                {/* Bloco de Parágrafo */}
                                {block.type === "PARAGRAPH" && (
                                  <textarea
                                    rows={3}
                                    className="w-full p-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-relaxed"
                                    placeholder="Escreva aqui o parágrafo descritivo..."
                                    value={block.content}
                                    onChange={(e) =>
                                      handleUpdateParagraphBlock(page.id, block.id, e.target.value)
                                    }
                                  />
                                )}

                                {/* Bloco de Nota (Callout) */}
                                {block.type === "NOTE" && (
                                  <div className="space-y-2 border-l-2 border-primary pl-2.5 py-0.5">
                                    <Input
                                      placeholder="Título da nota (opcional, ex: Atenção / SLA)"
                                      value={block.title || ""}
                                      onChange={(e) =>
                                        handleUpdateNoteBlock(page.id, block.id, "title", e.target.value)
                                      }
                                      className="h-7 text-xs font-semibold"
                                    />
                                    <textarea
                                      rows={2}
                                      className="w-full p-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-relaxed"
                                      placeholder="Conteúdo destacado da nota..."
                                      value={block.content}
                                      onChange={(e) =>
                                        handleUpdateNoteBlock(page.id, block.id, "content", e.target.value)
                                      }
                                    />
                                  </div>
                                )}

                                {/* Bloco de Lista (Estilo Escopo) */}
                                {block.type === "SCOPE_LIST" && (
                                  <div className="space-y-2">
                                    <Input
                                      placeholder="Título da Lista (ex: INFRAESTRUTURA & REDE)"
                                      value={block.title}
                                      onChange={(e) =>
                                        handleUpdateScopeListBlock(page.id, block.id, "title", e.target.value)
                                      }
                                      className="h-7 text-xs font-semibold uppercase tracking-wider"
                                    />
                                    <div className="space-y-1">
                                      <label className="text-[10px] text-muted-foreground">
                                        Pontos com marcadores (digite 1 ponto por linha):
                                      </label>
                                      <textarea
                                        rows={3}
                                        className="w-full p-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-relaxed"
                                        placeholder={"Servidores em redundância geográfica;\nDisponibilidade garantida de 99.9%;\nFirewall de camada 7 ativo..."}
                                        value={block.pointsText}
                                        onChange={(e) =>
                                          handleUpdateScopeListBlock(page.id, block.id, "pointsText", e.target.value)
                                        }
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Bloco de Tabela Customizada */}
                                {block.type === "TABLE" && (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] text-muted-foreground font-medium">
                                        Colunas ({block.headers.length}) e Linhas ({block.rows.length})
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleAddTableColumn(page.id, block.id)}
                                          className="h-5 text-[10px] px-2 cursor-pointer"
                                        >
                                          + Coluna
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleAddTableRow(page.id, block.id)}
                                          className="h-5 text-[10px] px-2 cursor-pointer"
                                        >
                                          + Linha
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="overflow-x-auto border rounded-md bg-background">
                                      <table className="w-full text-[11px] border-collapse">
                                        <thead>
                                          <tr className="bg-primary/10 border-b">
                                            {block.headers.map((h, cIdx) => (
                                              <th key={cIdx} className="p-1.5 text-left font-semibold">
                                                <div className="flex items-center gap-1">
                                                  <input
                                                    className="w-full bg-transparent border-b border-primary/40 focus:outline-none font-semibold text-[11px] text-primary"
                                                    value={h}
                                                    onChange={(e) =>
                                                      handleUpdateTableHeader(page.id, block.id, cIdx, e.target.value)
                                                    }
                                                  />
                                                  {block.headers.length > 1 && (
                                                    <button
                                                      type="button"
                                                      onClick={() => handleRemoveTableColumn(page.id, block.id, cIdx)}
                                                      className="text-muted-foreground hover:text-destructive text-[10px] px-1 cursor-pointer"
                                                      title="Remover coluna"
                                                    >
                                                      ×
                                                    </button>
                                                  )}
                                                </div>
                                              </th>
                                            ))}
                                            <th className="w-6 p-1.5"></th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {block.rows.map((row, rIdx) => (
                                            <tr key={rIdx} className="border-b last:border-b-0 hover:bg-muted/10">
                                              {row.map((cell, cIdx) => (
                                                <td key={cIdx} className="p-1.5">
                                                  <input
                                                    className="w-full bg-transparent border-0 focus:ring-1 focus:ring-ring rounded px-1 py-0.5 text-xs text-foreground"
                                                    value={cell}
                                                    onChange={(e) =>
                                                      handleUpdateTableCell(page.id, block.id, rIdx, cIdx, e.target.value)
                                                    }
                                                  />
                                                </td>
                                              ))}
                                              <td className="p-1 text-center">
                                                {block.rows.length > 1 && (
                                                  <button
                                                    type="button"
                                                    onClick={() => handleRemoveTableRow(page.id, block.id, rIdx)}
                                                    className="text-muted-foreground hover:text-destructive text-[11px] cursor-pointer"
                                                    title="Remover linha"
                                                  >
                                                    ×
                                                  </button>
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Coluna Lateral: Resumo, Condições e Cláusulas Contratuais */}
            <div className="space-y-6">
              <Card className="border-primary/30 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Icon name="Receipt" size={16} className="text-primary" />
                    Resumo do Documento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Cliente:</span>
                    <span className="font-semibold text-foreground truncate max-w-[150px]">
                      {clientName || "Em definição"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Escopos de projecto:</span>
                    <span className="font-semibold text-foreground">{scopeItems.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Fases orçadas:</span>
                    <span className="font-semibold text-foreground">{priceItems.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Prazo acumulado:</span>
                    <span className="font-semibold text-foreground">{totalDays} dias</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Páginas adicionais:</span>
                    <span className="font-semibold text-foreground">{customPages.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-xs text-foreground">Valor Global:</span>
                    <span className="font-mono font-semibold text-base text-primary">
                      {formatKwanza(totalValue)}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 cursor-pointer"
                    onClick={generateLivePdf}
                    disabled={isRenderingLivePdf}
                  >
                    <Icon
                      name={isRenderingLivePdf ? "LoaderCircle" : "FileText"}
                      size={14}
                      className={isRenderingLivePdf ? "animate-spin text-primary" : "text-primary"}
                    />
                    <span>{isRenderingLivePdf ? "A renderizar PDF..." : "Visualizar PDF Antes de Salvar"}</span>
                  </Button>

                  <Button disabled={createMutation.isPending} onClick={() => createMutation.mutate()} className="gap-1.5 text-xs cursor-pointer shadow-xs">
                    <Icon name="CircleCheck" size={14} />
                    <span>Salvar e Emitir {typeConfig.name}</span>
                  </Button>
                </CardFooter>
              </Card>

              {/* Páginas de Cláusulas Contratuais */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <Icon name="Layers" size={16} className="text-primary" />
                          Cláusulas & Condições Jurídicas
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px]">
                          {selectedClauses.length} seleccionadas
                        </Badge>
                      </div>
                      <CardDescription className="text-xs mt-0.5">
                        Biblioteca jurídica angolana (Lei 22/11, Lei 7/17, Lei 15/14, Lei 26/20, etc.)
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant={showConditions ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowConditions(!showConditions)}
                      className="h-7 text-xs cursor-pointer"
                    >
                      {showConditions ? "Activa" : "Omitida"}
                    </Button>
                  </div>
                </CardHeader>

                {showConditions && (
                  <CardContent className="space-y-3 pt-1">
                    {/* Botões de Seleção Rápida */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-border/50">
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const recommendedKeywords = [
                              "22/11",
                              "7/17",
                              "15/14",
                              "26/20",
                              "7/19",
                              "Garantia",
                              "Confidencialidade",
                              "Força Maior",
                              "Validade",
                            ];
                            const recIds = clauses
                              .filter((c) =>
                                recommendedKeywords.some((kw) => c.title.includes(kw))
                              )
                              .map((c) => c.id);
                            setSelectedClauses(recIds);
                            toast.success("Cláusulas essenciais recomendadas seleccionadas!");
                          }}
                          className="h-6 text-[10px] px-2 cursor-pointer"
                        >
                          Padrão Recomendado
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClauses(clauses.map((c) => c.id));
                            toast.success("Todas as cláusulas foram seleccionadas!");
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

                      <span className="text-[10px] text-muted-foreground font-medium">
                        Total no catálogo: {clauses.length}
                      </span>
                    </div>

                    {/* Filtro de Pesquisa e Categoria */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                      <div className="sm:col-span-6">
                        <Input
                          placeholder="Pesquisar cláusula por lei ou palavra..."
                          value={clauseSearch}
                          onChange={(e) => setClauseSearch(e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-6">
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

                    {/* Lista de Cláusulas com Scroll */}
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
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
                                  <Badge
                                    variant={isChecked ? "default" : "outline"}
                                    className="text-[9px] shrink-0"
                                  >
                                    {isChecked ? "Incluída" : "Omitida"}
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
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: VISUALIZADOR DE PDF EM TEMPO REAL (PRÉ & PÓS SALVAR)
            ======================================================== */}
        {activeTab === "pdf" && (
          <div className="h-[750px] w-full flex flex-col rounded-xl border bg-muted/10 overflow-hidden">
            <div className="px-4 py-2.5 bg-card border-b flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <Icon name="FileText" size={14} className="text-primary" />
                {createdDocumentId
                  ? "PDF emitido e renderizado em tempo real pelo motor da API"
                  : "Pré-visualização em tempo real do PDF (Rascunho Oficial Antes de Salvar)"}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = createdDocumentId
                      ? documentsService.getDirectPdfUrl(createdDocumentId)
                      : livePdfUrl;
                    if (url) window.open(url, "_blank");
                  }}
                  className="h-7 text-xs gap-1.5 cursor-pointer"
                  disabled={!createdDocumentId && !livePdfUrl}
                >
                  <Icon name="Download" size={12} />
                  <span>Descarregar PDF</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab("form")}
                  className="h-7 text-xs gap-1 cursor-pointer"
                >
                  <Icon name="ArrowLeft" size={12} />
                  <span>Voltar aos Ajustes</span>
                </Button>

                <Button disabled={createMutation.isPending} onClick={() => createMutation.mutate()} className="gap-1.5 text-xs cursor-pointer shadow-xs">
                  <Icon name="CircleCheck" size={12} />
                  <span>{createdDocumentId ? "Documento Salvo" : "Salvar e Emitir"}</span>
                </Button>
              </div>
            </div>

            {livePdfUrl || createdDocumentId ? (
              <iframe
                src={
                  createdDocumentId
                    ? documentsService.getDirectPdfUrl(createdDocumentId)
                    : (livePdfUrl as string)
                }
                className="w-full flex-1 border-0"
                title="PDF Real-Time Preview"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3">
                <Icon name="FileText" size={48} className="text-muted-foreground/40" />
                <div>
                  <h5 className="font-semibold text-sm text-foreground">
                    Carregar Pré-visualização do PDF
                  </h5>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Gere o PDF em tempo real agora mesmo com os dados atuais sem precisar salvar na base de dados.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={generateLivePdf}
                  disabled={isRenderingLivePdf}
                  className="gap-2 text-xs mt-2 cursor-pointer"
                >
                  <Icon
                    name={isRenderingLivePdf ? "LoaderCircle" : "FileText"}
                    size={14}
                    className={isRenderingLivePdf ? "animate-spin" : ""}
                  />
                  <span>{isRenderingLivePdf ? "Renderizando..." : "Gerar Preview Agora"}</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
