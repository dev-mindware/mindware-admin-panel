"use client";

import { useState } from "react";
import { useEmailTemplates, useUpdateTemplate, useCreateTemplate, useDeleteTemplate } from "@/hooks/email-center";
import { Skeleton, RequestError, Button, Icon } from "@/components";
import { useRouter } from "next/navigation";
import type { EmailTemplate, TemplateCategory } from "@/types";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

const CATEGORY_LABELS: Record<string, string> = {
  BILLING: "Cobrança",
  MARKETING: "Marketing",
};

const VARIABLE_TAGS = [
  "{{customer.name}}",
  "{{customer.email}}",
  "{{company.name}}",
  "{{subscription.plan}}",
  "{{subscription.amount}}",
  "{{subscription.dueDate}}",
  "{{subscription.daysOverdue}}",
  "{{payment.link}}",
  "{{currentDate}}",
];

interface TemplateCardProps {
  template: EmailTemplate;
  onEdit: (template: EmailTemplate) => void;
}

function TemplateCard({ template, onEdit }: TemplateCardProps) {
  const router = useRouter();
  const { mutate: deleteTpl, isPending: isDeleting } = useDeleteTemplate();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Tem a certeza que deseja eliminar o template "${template.name}"?`)) {
      deleteTpl(template.id, {
        onSuccess: () => SucessMessage("Template eliminado com sucesso!"),
        onError: (err: any) => ErrorMessage(err?.response?.data?.message || "Erro ao eliminar template"),
      });
    }
  };

  return (
    <div className="group rounded-xl border border-border bg-card p-5 flex flex-col gap-3 hover:border-primary/50 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${
            template.category === "BILLING"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-primary/10 text-primary"
          }`}>
            {CATEGORY_LABELS[template.category] ?? template.category}
          </span>
          <h4 className="font-semibold text-foreground text-sm leading-tight truncate">
            {template.name}
          </h4>
          <p className="text-xs text-muted-foreground mt-1 truncate">{template.subject}</p>
        </div>
        {template.isSystemDefault && (
          <span className="shrink-0 text-[11px] text-muted-foreground bg-muted border border-border rounded-full px-2 py-0.5">
            Padrão
          </span>
        )}
      </div>
      {template.preheader && (
        <p className="text-xs text-muted-foreground line-clamp-2">{template.preheader}</p>
      )}
      <div className="grid grid-cols-3 gap-1.5 mt-auto pt-2">
        <Button
          size="sm"
          className="text-xs px-2"
          onClick={() =>
            router.push(
              `/email-marketing/campaigns/new?templateId=${template.id}`
            )
          }
        >
          <Icon name="Send" className="w-3.5 h-3.5 mr-1" />
          Usar
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-xs px-2"
          onClick={() => onEdit(template)}
        >
          <Icon name="Pencil" className="w-3.5 h-3.5 mr-1 text-primary" />
          Editar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-xs px-2 text-muted-foreground hover:text-foreground"
          onClick={() =>
            router.push(
              `/email-marketing/campaigns/new?templateId=${template.id}&duplicate=1`
            )
          }
        >
          <Icon name="Copy" className="w-3.5 h-3.5 mr-1" />
          Duplicar
        </Button>
      </div>
    </div>
  );
}

export function TemplateList() {
  const { data: templates, isLoading, isError, refetch } = useEmailTemplates();
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    category: TemplateCategory;
    subject: string;
    preheader: string;
    contentHtml: string;
  }>({
    name: "",
    category: "MARKETING",
    subject: "",
    preheader: "",
    contentHtml: "",
  });

  const { mutate: updateTpl, isPending: isUpdating } = useUpdateTemplate();
  const { mutate: createTpl, isPending: isCreating } = useCreateTemplate();

  const handleOpenEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsCreatingNew(false);
    setFormData({
      name: template.name,
      category: template.category,
      subject: template.subject,
      preheader: template.preheader ?? "",
      contentHtml: typeof template.content === "string" ? template.content : (template.content as any)?.html ?? "",
    });
  };

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setIsCreatingNew(true);
    setFormData({
      name: "",
      category: "MARKETING",
      subject: "",
      preheader: "",
      contentHtml: "<p>Olá <strong>{{customer.name}}</strong>,</p>\n<p>Escreva o conteúdo do email aqui...</p>",
    });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      category: formData.category,
      subject: formData.subject,
      preheader: formData.preheader || undefined,
      content: { html: formData.contentHtml },
    };

    if (editingTemplate) {
      updateTpl(
        { id: editingTemplate.id, payload },
        {
          onSuccess: () => {
            SucessMessage("Template actualizado com sucesso!");
            setEditingTemplate(null);
          },
          onError: (err: any) => ErrorMessage(err?.response?.data?.message || "Erro ao actualizar template"),
        }
      );
    } else if (isCreatingNew) {
      createTpl(payload, {
        onSuccess: () => {
          SucessMessage("Template criado com sucesso!");
          setIsCreatingNew(false);
        },
        onError: (err: any) => ErrorMessage(err?.response?.data?.message || "Erro ao criar template"),
      });
    }

  };

  const handleInsertVar = (varTag: string) => {
    setFormData((prev) => ({
      ...prev,
      contentHtml: prev.contentHtml + varTag,
    }));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <RequestError refetch={refetch} message="Erro ao carregar templates" />;
  }

  const billing = templates?.filter((t) => t.category === "BILLING") ?? [];
  const marketing = templates?.filter((t) => t.category === "MARKETING") ?? [];

  return (
    <div className="space-y-8 pt-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Biblioteca de {templates?.length ?? 0} templates configurados
        </p>
        <Button size="sm" onClick={handleOpenCreate}>
          <Icon name="Plus" className="w-4 h-4 mr-1.5" />
          Novo Template
        </Button>
      </div>

      {billing.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
            <Icon name="Receipt" className="w-4 h-4 text-primary" />
            Templates de Cobrança
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {billing.map((t) => (
              <TemplateCard key={t.id} template={t} onEdit={handleOpenEdit} />
            ))}
          </div>
        </div>
      )}

      {marketing.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
            <Icon name="Megaphone" className="w-4 h-4 text-primary" />
            Templates de Marketing
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {marketing.map((t) => (
              <TemplateCard key={t.id} template={t} onEdit={handleOpenEdit} />
            ))}
          </div>
        </div>
      )}

      {/* ─── Template Edit / Create Modal ─────────────────────────────── */}
      {(editingTemplate || isCreatingNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Icon name="Pencil" className="w-4 h-4 text-primary" />
                {editingTemplate ? `Editar Template: ${editingTemplate.name}` : "Novo Template de Email"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingTemplate(null);
                  setIsCreatingNew(false);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <Icon name="X" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Nome do Template</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Aviso de Vencimento 5 Dias"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TemplateCategory })}
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="BILLING">Cobrança</option>
                    <option value="MARKETING">Marketing</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Assunto Padrão</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ex: A sua subscrição do MINDGEST vence em breve"
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Pré-header Padrão (Opcional)</label>
                <input
                  type="text"
                  value={formData.preheader}
                  onChange={(e) => setFormData({ ...formData, preheader: e.target.value })}
                  placeholder="Ex: Lembrete de renovação de subscrição"
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-foreground">Conteúdo HTML</label>
                  <span className="text-[11px] text-muted-foreground">Suporta tags HTML &amp; Variáveis</span>
                </div>
                <textarea
                  rows={8}
                  value={formData.contentHtml}
                  onChange={(e) => setFormData({ ...formData, contentHtml: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                />
              </div>

              {/* Dynamic Variables Quick Insert */}
              <div className="bg-muted/40 border border-border rounded-lg p-3">
                <p className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  Inserir Variável Dinâmica:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {VARIABLE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleInsertVar(tag)}
                      className="text-[11px] font-mono px-2 py-0.5 rounded border border-border bg-background hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingTemplate(null);
                    setIsCreatingNew(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={isUpdating || isCreating}>
                  <Icon name="Save" className="w-4 h-4 mr-1.5" />
                  {isUpdating || isCreating ? "A guardar..." : "Guardar Alterações"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
