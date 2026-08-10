"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useCreateCampaign, useUpdateCampaign, useSendTestEmail } from "@/hooks/email-center";
import { useEmailTemplates } from "@/hooks/email-center";
import { Button, Icon } from "@/components";
import type { CreateCampaignPayload, CampaignType, EmailCampaign } from "@/types";
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
  const { mutate: createCampaign, isPending: isCreating } = useCreateCampaign();
  const { mutate: updateCampaign, isPending: isUpdating } = initial
    ? useUpdateCampaign(initial.id)
    : { mutate: undefined, isPending: false };

  const [showPreview, setShowPreview] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState("");

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

  const onSubmit = handleSubmit((values) => {
    const payload = {
      ...values,
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

  // ─── Branded Preview HTML (Identical to EmailLayoutBuilder) ─────────────
  const frontendUrl = "https://mindgest.mindware.ao";
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
          background-color: #f5f3ff;
          color: #374151;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          max-width: 620px;
          margin: 16px auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #ece9ff;
          box-shadow: 0 10px 30px rgba(153, 86, 246, 0.08);
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
          background: #ffffff;
          padding: 28px 24px 20px 24px;
          text-align: center;
          border-bottom: 1px solid #f3e8ff;
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
          background-color: #f3e8ff;
          color: #7c3aed;
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
          color: #374151;
        }
        .content-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-top: 0;
          margin-bottom: 18px;
          text-align: center;
          letter-spacing: -0.3px;
        }
        .footer {
          background-color: #faf8ff;
          padding: 28px 20px;
          text-align: center;
          border-top: 1px solid #f3e8ff;
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          color: #6b7280;
        }
        .footer-logo-container {
          margin-bottom: 10px;
        }
        .footer-logo-title {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #9956f6;
          letter-spacing: -0.5px;
          margin: 4px 0 0 0;
        }
        .footer-links {
          margin: 12px 0;
        }
        .footer-links a {
          color: #7c3aed;
          text-decoration: none;
          margin: 0 6px;
          font-weight: 500;
          font-size: 11px;
        }
        .footer-note {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 14px;
          line-height: 1.5;
        }
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
              <img src="${frontendUrl}/logo.png" alt="MINDGEST Logo" height="30" style="border:0; height:30px; max-height:30px; vertical-align:middle;" onError="this.style.display='none'" />
              <div class="footer-logo-title">MINDGEST - Software de Gestão e Facturação</div>
            </a>
          </div>
          <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 11px;">Mindware Software, Lda</p>
          
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
        {/* ─── Top Toolbar ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-card rounded-t-lg">
          <div className="flex items-center gap-3">
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
            <span className="text-sm font-medium">
              {isEditing ? "Editar Campanha" : "Nova Campanha"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTestModal(true)}
            >
              <Icon name="Send" className="w-4 h-4 mr-2" />
              Enviar Teste
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreview((v) => !v)}
            >
              <Icon name={showPreview ? "EyeOff" : "Eye"} className="w-4 h-4 mr-2" />
              {showPreview ? "Ocultar Preview" : "Mostrar Preview"}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isCreating || isUpdating}
              className="shadow-md shadow-primary/20"
            >
              <Icon name="Save" className="w-4 h-4 mr-2" />
              {isCreating || isUpdating ? "A guardar..." : "Guardar"}
            </Button>
          </div>
        </div>

        {/* ─── Main Split Layout ────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden border-b rounded-b-lg">
          {/* Editor Panel */}
          <div className="flex-1 overflow-y-auto border-r bg-card">
            <div className="p-6 space-y-5 max-w-2xl">
              {/* Campaign Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Nome da Campanha
                </label>
                <input
                  {...register("name", { required: true })}
                  placeholder="Ex: Recuperação de Clientes — Agosto"
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Type & Schedule Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Tipo</label>
                  <select
                    {...register("type")}
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {CAMPAIGN_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">
                    Agendar para
                  </label>
                  <input
                    type="datetime-local"
                    {...register("scheduledAt")}
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Assunto</label>
                <input
                  {...register("subject", { required: true })}
                  placeholder="Ex: A sua subscrição do MINDGEST expirou"
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Pre-header */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Pré-header
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    (texto após o assunto em alguns clientes de email)
                  </span>
                </label>
                <input
                  {...register("preheader")}
                  placeholder="Ex: Clique aqui para regularizar a sua subscrição"
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Content Editor */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Conteúdo</label>
                <textarea
                  value={contentHtml}
                  onChange={(e) => setValue("content", { html: e.target.value })}
                  rows={14}
                  placeholder={`<p>Olá {{customer.name}},</p>\n<p>A sua subscrição...</p>`}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono resize-y"
                />
              </div>

              {/* Dynamic Variables Panel */}
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wide flex items-center gap-1.5">
                  <Icon name="Code" className="w-3.5 h-3.5 text-primary" />
                  Variáveis Dinâmicas
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
                  <label className="text-sm font-medium text-foreground">
                    Template Base
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
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-[440px] shrink-0 overflow-y-auto bg-muted/20 border-l border-border">
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 border-b bg-card">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Icon name="Eye" className="w-3.5 h-3.5 text-primary" />
                  Preview ({previewDevice === "desktop" ? "Desktop" : "Mobile"})
                </span>
                <div className="flex rounded-md overflow-hidden border border-border">
                  {(["desktop", "mobile"] as const).map((device) => (
                    <button
                      key={device}
                      type="button"
                      onClick={() => setPreviewDevice(device)}
                      className={`px-3 py-1 text-xs transition-colors ${
                        previewDevice === device
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {device === "desktop" ? "Desktop" : "Mobile"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 flex justify-center">
                <div
                  style={{
                    width: previewDevice === "mobile" ? "365px" : "100%",
                    transition: "width 0.25s ease-in-out",
                  }}
                >
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full rounded-lg border border-border shadow-sm"
                    style={{ height: "650px", background: "#f5f3ff" }}
                    sandbox="allow-same-origin"
                    title="Email Live Preview"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* ─── Test Email Modal ──────────────────────────────────────────── */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
