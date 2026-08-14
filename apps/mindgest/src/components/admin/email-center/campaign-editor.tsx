"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useCreateCampaign, useUpdateCampaign, useSendTestEmail } from "@/hooks/email-center";
import { useEmailTemplates } from "@/hooks/email-center";
import { useCompanies } from "@/hooks/company";
import { Button, Icon, Skeleton } from "@/components";
import type { CreateCampaignPayload, CampaignType, EmailCampaign, Company } from "@/types";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

const VARIABLE_GROUPS = [
  {
    label: "Cliente",
    vars: ["{{customer.name}}", "{{customer.email}}"],
  },
  {
    label: "Empresa",
    vars: ["{{company.name}}"],
  },
  {
    label: "Subscrição",
    vars: [
      "{{subscription.plan}}",
      "{{subscription.amount}}",
      "{{subscription.dueDate}}",
      "{{subscription.expirationDate}}",
      "{{subscription.daysOverdue}}",
    ],
  },
  {
    label: "Pagamento",
    vars: ["{{payment.link}}", "{{invoice.number}}"],
  },
  {
    label: "Sistema",
    vars: ["{{currentDate}}"],
  },
];

const CAMPAIGN_TYPE_OPTIONS: { value: CampaignType; label: string }[] = [
  { value: "BILLING", label: "Cobrança" },
  { value: "MARKETING", label: "Marketing" },
  { value: "PUBLICITY", label: "Publicidade" },
];

interface CampaignEditorProps {
  initial?: EmailCampaign;
}

export function CampaignEditor({ initial }: CampaignEditorProps) {
  const router = useRouter();
  const isEditing = !!initial;

  const { data: templates } = useEmailTemplates();
  const { data: companiesData, isLoading: isLoadingCompanies } = useCompanies();
  const companiesList: Company[] = Array.isArray(companiesData) ? (companiesData as Company[]) : [];

  const { mutate: createCampaign, isPending: isCreating } = useCreateCampaign();
  const { mutate: updateCampaign, isPending: isUpdating } = initial
    ? useUpdateCampaign(initial.id)
    : { mutate: undefined, isPending: false };

  const [showPreview, setShowPreview] = useState(true);
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  // Resizable preview width state (default 440px)
  const [previewWidth, setPreviewWidth] = useState(440);
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(440);

  // Collapsible company selection list state (hidden by default to save screen height)
  const [isCompanyListOpen, setIsCompanyListOpen] = useState(false);

  // Targeting Mode State: "ALL_EXPIRED" or "SELECTED_COMPANIES"
  const initialSegment = (initial?.segmentFilters as any) || {};
  const [targetMode, setTargetMode] = useState<"ALL_EXPIRED" | "SELECTED_COMPANIES">(
    initialSegment.subscriptionStatus?.includes("EXPIRED") ? "ALL_EXPIRED" : "SELECTED_COMPANIES"
  );
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(
    initialSegment.companyIds ?? []
  );
  const [companySearch, setCompanySearch] = useState("");

  const { mutate: sendTest, isPending: isTesting } = useSendTestEmail();

  const { register, handleSubmit, watch, setValue, getValues } = useForm<CreateCampaignPayload>({
    defaultValues: {
      name: initial?.name ?? "",
      subject: initial?.subject ?? "",
      preheader: initial?.preheader ?? "",
      type: initial?.type ?? "MARKETING",
      content: initial?.content ?? { html: "" },
      scheduledAt: initial?.scheduledAt
        ? new Date(initial.scheduledAt).toISOString().slice(0, 16)
        : "",
    },
  });

  const watchedContent = watch("content");
  const watchedSubject = watch("subject");
  const watchedPreheader = watch("preheader");
  const contentHtml =
    typeof watchedContent === "string"
      ? watchedContent
      : (watchedContent as any)?.html ?? "";

  const handleInsertVariable = (variable: string) => {
    const current = (getValues("content") as any)?.html ?? "";
    setValue("content", { html: current + variable });
  };

  const filteredCompanies = useMemo(() => {
    if (!companySearch.trim()) return companiesList;
    const q = companySearch.toLowerCase();
    return companiesList.filter(
      (c: Company) =>
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.taxNumber && String(c.taxNumber).includes(q))
    );
  }, [companiesList, companySearch]);

  const toggleCompanySelection = (id: string) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllCompanies = () => {
    if (selectedCompanyIds.length === filteredCompanies.length) {
      setSelectedCompanyIds([]);
    } else {
      setSelectedCompanyIds(filteredCompanies.map((c: Company) => c.id));
    }
  };

  // ─── Resizer logic from left border of preview panel ─────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = previewWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      // Dragging left increases width, dragging right decreases width
      const deltaX = startXRef.current - moveEvent.clientX;
      const newWidth = Math.min(Math.max(startWidthRef.current + deltaX, 300), 850);
      setPreviewWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [previewWidth]);

  const onSubmit = handleSubmit((values) => {
    const segmentFilters =
      targetMode === "ALL_EXPIRED"
        ? { subscriptionStatus: ["EXPIRED", "PAST_DUE"] }
        : { companyIds: selectedCompanyIds };

    const payload = {
      ...values,
      segmentFilters,
      content: { html: contentHtml },
      scheduledAt: values.scheduledAt ? new Date(values.scheduledAt as any).toISOString() : undefined,
    };

    if (isEditing && updateCampaign) {
      updateCampaign(payload, {
        onSuccess: () => {
          SucessMessage("Campanha actualizada com sucesso!");
          router.push("/email-marketing/campaigns");
        },
        onError: (err: any) => ErrorMessage(err?.response?.data?.message || "Erro ao actualizar campanha"),
      });
    } else {
      createCampaign(payload, {
        onSuccess: () => {
          SucessMessage("Campanha criada com sucesso!");
          router.push("/email-marketing/campaigns");
        },
        onError: (err: any) => ErrorMessage(err?.response?.data?.message || "Erro ao criar campanha"),
      });
    }
  });

  const handleSendTest = () => {
    if (!testEmail) return;
    sendTest(
      {
        toEmail: testEmail,
        subject: watchedSubject,
        contentHtml,
      },
      {
        onSuccess: () => {
          SucessMessage(`Email de teste enviado para ${testEmail}`);
          setShowTestModal(false);
        },
        onError: (err: any) => ErrorMessage(err?.response?.data?.message || "Erro ao enviar email de teste"),
      }
    );
  };

  // ─── Branded Preview HTML (Light & Dark Theme, No Image Logo Tag) ────────
  const frontendUrl = "https://mindgest.mindware.ao";
  const isDark = previewTheme === "dark";

  const themeStyles = isDark
    ? `
      /* mindgest-frontend Dark Mode Standards (#0f0f0f background, #161616 card, #2b2b2b border) */
      body { background-color: #0f0f0f; color: #f5f5f7; }
      .wrapper { background: #161616; border-color: #2b2b2b; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6); }
      .header { background: #161616; border-bottom-color: #2b2b2b; }
      .brand-logo { color: #a855f7; }
      .brand-badge { background-color: #202020; color: #c084fc; border: 1px solid #2b2b2b; }
      .content-body { color: #e8eaed; }
      .content-title { color: #ffffff; }
      .footer { background-color: #0f0f0f; border-top-color: #2b2b2b; color: #9b9b9b; }
      .footer-logo-title { color: #a855f7; }
      .footer-links a { color: #c084fc; }
      .footer-note { color: #71717a; }
    `
    : `
      /* mindgest-frontend Light Mode Standards */
      body { background-color: #f5f3ff; color: #374151; }
      .wrapper { background: #ffffff; border-color: #ece9ff; box-shadow: 0 10px 30px rgba(153, 86, 246, 0.08); }
      .header { background: #ffffff; border-bottom-color: #f3e8ff; }
      .brand-logo { color: #9956f6; }
      .brand-badge { background-color: #f3e8ff; color: #7c3aed; }
      .content-body { color: #374151; }
      .content-title { color: #111827; }
      .footer { background-color: #faf8ff; border-top-color: #f3e8ff; color: #6b7280; }
      .footer-logo-title { color: #9956f6; }
      .footer-links a { color: #7c3aed; }
      .footer-note { color: #9ca3af; }
    `;


  const previewHtml = `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${watchedSubject || "Pre-visualização"}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          max-width: 620px;
          margin: 16px auto;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid;
        }
        @media only screen and (max-width: 520px) {
          .wrapper {
            margin: 8px auto !important;
            border-radius: 12px !important;
            width: 100% !important;
          }
          .content-body {
            padding: 20px 16px !important;
          }
          .header {
            padding: 20px 16px 16px 16px !important;
          }
          .footer {
            padding: 20px 16px !important;
          }
        }
        .header-bar {
          height: 6px;
          background: linear-gradient(90deg, #9956f6 0%, #c084fc 50%, #7c3aed 100%);
        }
        .header {
          padding: 28px 24px 20px 24px;
          text-align: center;
          border-bottom: 1px solid;
        }
        .brand-box {
          display: inline-block;
          text-align: center;
        }
        .brand-logo {
          font-family: 'Outfit', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #9956f6;
          letter-spacing: -0.5px;
          margin: 0;
          line-height: 1;
        }
        .brand-badge {
          display: inline-block;
          font-family: 'Outfit', sans-serif;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 20px;
          margin-top: 6px;
          letter-spacing: 0.12em;
        }
        .content-body {
          padding: 32px 24px;
          line-height: 1.7;
          font-size: 14px;
        }
        .content-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 700;
          margin-top: 0;
          margin-bottom: 18px;
          text-align: center;
          letter-spacing: -0.3px;
        }
        .footer {
          padding: 28px 20px;
          text-align: center;
          border-top: 1px solid;
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
        }
        .footer-logo-container {
          margin-bottom: 10px;
        }
        .footer-logo-title {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin: 4px 0 0 0;
        }
        .footer-links {
          margin: 12px 0;
        }
        .footer-links a {
          text-decoration: none;
          margin: 0 6px;
          font-weight: 500;
          font-size: 11px;
        }
        .footer-note {
          font-size: 11px;
          margin-top: 14px;
          line-height: 1.5;
        }
        ${themeStyles}
      </style>
    </head>
    <body>
      ${watchedPreheader ? `<div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${watchedPreheader}</div>` : ""}
      <div class="wrapper">
        <div class="header-bar"></div>
        <div class="header">
          <div class="brand-box">
            <h1 class="brand-logo">MINDGEST</h1>
            <div class="brand-badge">Gestão &amp; Facturação Simplificadas</div>
          </div>
        </div>
        
        <div class="content-body">
          ${watchedSubject ? `<h2 class="content-title">${watchedSubject}</h2>` : ""}
          ${contentHtml || "<p style='color:#9ca3af; text-align:center;'>O seu conteúdo aparecerá aqui...</p>"}
        </div>
        
        <div class="footer">
          <div class="footer-logo-container">
            <a href="${frontendUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
              <div class="footer-logo-title">MINDGEST - Software de Gestão e Facturação</div>
            </a>
          </div>
          <p style="margin: 4px 0 0 0; font-size: 11px;">Mindware - Comércio e Serviços, Lda</p>
          
          <div class="footer-links">
            <a href="${frontendUrl}" target="_blank">Website Oficial</a> -
            <a href="${frontendUrl}/suporte" target="_blank">Centro de Suporte</a> -
            <a href="${frontendUrl}/termos" target="_blank">Termos &amp; Privacidade</a>
          </div>
          
          <div class="footer-note">
            Esta é uma mensagem automática enviada pela plataforma MINDGEST.<br>
            &copy; ${new Date().getFullYear()} MINDWARE. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return (
    <div className="h-full space-y-4">
      <form onSubmit={onSubmit} className="flex flex-col h-full gap-0">
        {/* ─── Top Toolbar (Responsive Header) ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3 border-b bg-card rounded-t-lg gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <Icon name="ArrowLeft" className="w-4 h-4 mr-1" />
              Voltar
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="text-xs sm:text-sm font-medium truncate">
              {isEditing ? "Editar Campanha" : "Nova Campanha"}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTestModal(true)}
              className="text-xs"
            >
              <Icon name="Send" className="w-3.5 h-3.5 mr-1.5" />
              Enviar Teste
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreview((v) => !v)}
              className="text-xs"
            >
              <Icon name={showPreview ? "EyeOff" : "Eye"} className="w-3.5 h-3.5 mr-1.5" />
              {showPreview ? "Ocultar Preview" : "Mostrar Preview"}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isCreating || isUpdating}
              className="shadow-md shadow-primary/20 text-xs"
            >
              <Icon name="Save" className="w-3.5 h-3.5 mr-1.5" />
              {isCreating || isUpdating ? "A guardar..." : "Guardar"}
            </Button>
          </div>
        </div>

        {/* ─── Main Split Layout (Resizable & Responsive) ────────────────── */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden border-b rounded-b-lg">
          {/* Editor Panel */}
          <div className="flex-1 overflow-y-auto bg-card min-w-0">
            <div className="p-4 sm:p-6 space-y-5 max-w-3xl">
              {/* Campaign Name */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-foreground">
                  Nome da Campanha
                </label>
                <input
                  {...register("name", { required: true })}
                  placeholder="Ex: Comunicação Especial — Empresas Seleccionadas"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Target Segment Selector */}
              <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Icon name="Users" className="w-4 h-4 text-primary" />
                  Público Alvo / Destinatários
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetMode("ALL_EXPIRED")}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      targetMode === "ALL_EXPIRED"
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="text-xs font-semibold flex items-center justify-between">
                      Todas as Expiradas
                      {targetMode === "ALL_EXPIRED" && <Icon name="Check" className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-[11px] font-normal mt-1 opacity-80">
                      Dispara automaticamente para <strong>todas</strong> as empresas com subscrição expirada / em atraso.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetMode("SELECTED_COMPANIES")}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      targetMode === "SELECTED_COMPANIES"
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="text-xs font-semibold flex items-center justify-between">
                      Grupo Selecto de Empresas
                      {targetMode === "SELECTED_COMPANIES" && <Icon name="Check" className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-[11px] font-normal mt-1 opacity-80">
                      Escolha manualmente as empresas/owners específicas a receber esta mensagem.
                    </p>
                  </button>
                </div>

                {/* Collapsible Company Multi-Selector (Saves screen height!) */}
                {targetMode === "SELECTED_COMPANIES" && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">
                        Seleccionadas: <strong className="text-primary">{selectedCompanyIds.length}</strong> de {companiesList.length} empresas
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCompanyListOpen((v) => !v)}
                        className="text-xs text-primary hover:text-primary/80 h-7 px-2"
                      >
                        <Icon
                          name={isCompanyListOpen ? "ChevronUp" : "ChevronDown"}
                          className="w-3.5 h-3.5 mr-1"
                        />
                        {isCompanyListOpen ? "Ocultar Lista" : "Expandir Lista"}
                      </Button>
                    </div>

                    {isCompanyListOpen && (
                      <div className="space-y-3 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <input
                            type="text"
                            value={companySearch}
                            onChange={(e) => setCompanySearch(e.target.value)}
                            placeholder="Pesquisar por nome, email ou NIF..."
                            className="px-2.5 py-1 text-xs border border-input rounded-md bg-background text-foreground focus:outline-none w-full sm:w-64"
                          />
                          <button
                            type="button"
                            onClick={toggleSelectAllCompanies}
                            className="text-xs font-medium text-primary hover:underline text-left sm:text-right"
                          >
                            {selectedCompanyIds.length === filteredCompanies.length ? "Desmarcar Todas" : "Marcar Todas"}
                          </button>
                        </div>

                        {isLoadingCompanies ? (
                          <Skeleton className="h-28 w-full rounded-md" />
                        ) : filteredCompanies.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-3 text-center">Nenhuma empresa encontrada.</p>
                        ) : (
                          <div className="max-h-48 overflow-y-auto rounded-md border border-border bg-background p-2 divide-y divide-border/40">
                            {filteredCompanies.map((comp: Company) => {
                              const isSelected = selectedCompanyIds.includes(comp.id);
                              return (
                                <label
                                  key={comp.id}
                                  className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer hover:bg-muted/40 transition-colors ${
                                    isSelected ? "bg-primary/5" : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleCompanySelection(comp.id)}
                                      className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                                    />
                                    <div className="truncate">
                                      <span className="font-semibold text-foreground">{comp.name}</span>
                                      {comp.email && <span className="text-[11px] text-muted-foreground ml-2">({comp.email})</span>}
                                      {comp.taxNumber && <span className="text-[11px] text-muted-foreground ml-2">NIF: {comp.taxNumber}</span>}
                                    </div>
                                  </div>
                                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                                    comp.isActive
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                      : "bg-muted text-muted-foreground"
                                  }`}>
                                    {comp.isActive ? "Activa" : "Inactiva"}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Type & Schedule Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-foreground">Tipo de Campanha</label>
                  <select
                    {...register("type")}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {CAMPAIGN_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-foreground">
                    Agendar Envio (Opcional)
                  </label>
                  <input
                    type="datetime-local"
                    {...register("scheduledAt")}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-foreground">Assunto do Email</label>
                <input
                  {...register("subject", { required: true })}
                  placeholder="Ex: Novidades importantes para a empresa {{company.name}}"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Pre-header */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-foreground">
                  Pré-header
                  <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                    (texto após o assunto nos leitores de email)
                  </span>
                </label>
                <input
                  {...register("preheader")}
                  placeholder="Ex: Veja os detalhes preparados para si"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Content Editor */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-foreground">Conteúdo do Email</label>
                <textarea
                  value={contentHtml}
                  onChange={(e) => setValue("content", { html: e.target.value })}
                  rows={14}
                  placeholder={`<p>Olá <strong>{{customer.name}}</strong>,</p>\n<p>Escreva o seu texto aqui...</p>`}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono resize-y"
                />
              </div>

              {/* Dynamic Variables Panel */}
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wide flex items-center gap-1.5">
                  <Icon name="Code" className="w-3.5 h-3.5 text-primary" />
                  Variáveis Dinâmicas Disponíveis
                </p>
                <div className="space-y-3">
                  {VARIABLE_GROUPS.map((group) => (
                    <div key={group.label}>
                      <p className="text-xs text-muted-foreground mb-1">{group.label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.vars.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => handleInsertVariable(v)}
                            className="text-xs font-mono px-2 py-1 rounded-md bg-background border border-border text-primary hover:bg-primary/5 transition-colors"
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Template selector */}
              {templates && templates.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-foreground">
                    Carregar a partir de um Template
                  </label>
                  <select
                    onChange={(e) => {
                      const tpl = templates.find((t) => t.id === e.target.value);
                      if (tpl) {
                        setValue("subject", tpl.subject);
                        if (tpl.preheader) setValue("preheader", tpl.preheader);
                        setValue("content", tpl.content ?? { html: "" });
                      }
                    }}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">— Seleccionar template —</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Resizable Live Preview Panel with Left Border Drag Handle & Light/Dark Theme Switch */}
          {showPreview && (
            <div className="flex relative shrink-0">
              {/* Left Border Drag Resizer Handle */}
              <div
                onMouseDown={handleMouseDown}
                title="Arraste para redimensionar a largura do preview"
                className="w-2 hover:w-2.5 bg-border/80 hover:bg-primary cursor-col-resize transition-colors z-20 flex items-center justify-center group"
              >
                <div className="w-0.5 h-8 bg-muted-foreground/50 group-hover:bg-primary-foreground rounded-full" />
              </div>

              {/* Preview Content Container */}
              <div
                style={{ width: `${previewWidth}px` }}
                className="overflow-y-auto bg-muted/20 border-t lg:border-t-0 border-border flex flex-col min-w-[300px]"
              >
                <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 border-b bg-card">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <Icon name="Eye" className="w-3.5 h-3.5 text-primary" />
                    Preview ({previewWidth}px)
                  </span>

                  {/* Light / Dark Mode Toggle */}
                  <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-background">
                    <button
                      type="button"
                      onClick={() => setPreviewTheme("light")}
                      className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors flex items-center gap-1 ${
                        previewTheme === "light"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon name="Sun" className="w-3 h-3" />
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTheme("dark")}
                      className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors flex items-center gap-1 ${
                        previewTheme === "dark"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon name="Moon" className="w-3 h-3" />
                      Dark
                    </button>
                  </div>
                </div>

                <div className="p-4 flex justify-center flex-1">
                  <div className="w-full">
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full rounded-lg border border-border shadow-sm"
                      style={{ height: "650px", background: isDark ? "#0f0f0f" : "#f5f3ff" }}

                      sandbox="allow-same-origin"
                      title="Email Live Preview"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* ─── Test Email Modal ──────────────────────────────────────────── */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Icon name="Send" className="w-4 h-4 text-primary" />
              Enviar Email de Teste
            </h3>
            <p className="text-sm text-muted-foreground">
              Introduza o email para receber o teste com os dados de exemplo.
            </p>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="admin@mindware.ao"
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTestModal(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSendTest}
                disabled={isTesting || !testEmail}
              >
                {isTesting ? "A enviar..." : "Enviar Teste"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
