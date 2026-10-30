"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Button,
  FormSection,
  Icon,
  Input,
  ListSkeleton,
  MultiSelect,
  PageWrapper,
  RequestError,
  SelectField,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  TitleList,
} from "@workspace/ui";
import {
  DOCUMENT_FORMS,
  getPath,
  setPath,
  type FormField,
  type TypeFormDef,
} from "@/constants/document-forms";
import type { DocumentTypeConfig } from "@/constants/document-types";
import { formatPtLongDate } from "@/lib/format";
import { clausesService } from "@/services/clauses-service";
import { documentsService, type DocumentItem, type PriceItem } from "@/services/documents-service";

interface Props {
  typeConfig: DocumentTypeConfig;
  /** Presente ao editar um documento já criado. */
  documentId?: string;
}

interface FreeSection {
  title: string;
  body: string;
}

type Values = Record<string, string>;

const errorText = (err: unknown, fallback: string) => {
  const e = err as { response?: { data?: { message?: string | string[] } }; message?: string };
  const m = e?.response?.data?.message;
  return (Array.isArray(m) ? m.join(" · ") : m) || e?.message || fallback;
};

function initialValues(def: TypeFormDef): Values {
  const base: Values = { city: "Luanda", emissionDate: formatPtLongDate() };
  for (const [k, v] of Object.entries(def.defaults)) base[k] = String(v);
  return base;
}

/** Valores do formulário a partir dos metadados guardados. */
function valuesFromMetadata(def: TypeFormDef, metadata: Record<string, any> | null | undefined): Values {
  const values = initialValues(def);
  const fields = def.sections.flatMap((s) => s.fields);
  for (const f of fields) {
    const raw = getPath(metadata ?? {}, f.key);
    if (raw === undefined || raw === null) continue;
    values[f.key] = Array.isArray(raw) ? raw.join("\n") : String(raw);
  }
  return values;
}

function buildMetadata(def: TypeFormDef, values: Values, sections: FreeSection[]) {
  const meta: Record<string, any> = {};
  for (const f of def.sections.flatMap((s) => s.fields)) {
    const raw = (values[f.key] ?? "").trim();
    if (!raw) continue;
    if (f.kind === "number") setPath(meta, f.key, Number(raw));
    else if (f.key === "mutual") setPath(meta, f.key, raw === "true");
    else setPath(meta, f.key, raw);
  }
  const free = sections.filter((s) => s.title.trim() || s.body.trim());
  if (free.length) meta.sections = free.map((s) => ({ title: s.title.trim(), body: s.body.trim() }));
  return meta;
}

export function TextDocumentView({ typeConfig, documentId }: Props) {
  const def = DOCUMENT_FORMS[typeConfig.slug];
  const router = useRouter();
  const queryClient = useQueryClient();
  const editing = Boolean(documentId);

  const [code, setCode] = useState(
    `${typeConfig.prefix}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
  );
  const [title, setTitle] = useState(typeConfig.singularName);
  const [client, setClient] = useState({ name: "", nif: "", address: "" });
  const [values, setValues] = useState<Values>(() => initialValues(def));
  const [sections, setSections] = useState<FreeSection[]>([]);
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  const [clauseIds, setClauseIds] = useState<string[]>([]);
  const [tab, setTab] = useState<"form" | "preview">("form");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const pdfRef = useRef<string | null>(null);

  const loaded = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => documentsService.getDocumentById(documentId as string),
    enabled: editing,
  });

  const clauses = useQuery({
    queryKey: ["clauses", "all"],
    queryFn: () => clausesService.getClauses({ limit: 100 }),
    enabled: Boolean(def.clauseLibrary),
  });

  // Preenche o formulário com o documento a editar.
  useEffect(() => {
    const doc: DocumentItem | undefined = loaded.data;
    if (!doc) return;
    setCode(doc.code);
    setTitle(doc.title);
    setClient({
      name: doc.client?.name ?? "",
      nif: doc.client?.nif?.startsWith("SN-") ? "" : (doc.client?.nif ?? ""),
      address: (doc.client as { address?: string } | undefined)?.address ?? "",
    });
    setValues(valuesFromMetadata(def, doc.metadata));
    setSections(
      Array.isArray(doc.metadata?.sections)
        ? doc.metadata.sections.map((s: any) => ({ title: s.title ?? "", body: s.body ?? "" }))
        : [],
    );
    setPriceItems(doc.priceItems ?? []);
    setClauseIds((doc.clauses ?? []).map((c) => c.clause.id));
  }, [loaded.data, def]);

  useEffect(
    () => () => {
      if (pdfRef.current) URL.revokeObjectURL(pdfRef.current);
    },
    [],
  );

  const clauseOptions = useMemo(
    () => (clauses.data?.data ?? []).map((c) => ({ value: c.id, label: c.title })),
    [clauses.data],
  );

  const setValue = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));

  /** Primeiro problema encontrado (ou null). */
  function validate(): string | null {
    if (!title.trim()) return "Indique o título.";
    if (def.client) {
      if (!client.name.trim()) return `Indique ${def.client.nameLabel.toLowerCase()}.`;
      if (def.client.nifRequired && !client.nif.trim()) return "Indique o NIF.";
    }
    for (const f of def.sections.flatMap((s) => s.fields)) {
      if (f.required && !(values[f.key] ?? "").trim()) return `Preencha «${f.label}».`;
    }
    if (priceItems.some((p) => !p.phaseName.trim() || !p.deliverable.trim())) {
      return "Cada item de preço precisa de fase e entregável.";
    }
    return null;
  }

  function payload() {
    return {
      type: typeConfig.slug,
      code,
      title: title.trim(),
      clientName: client.name.trim() || undefined,
      clientNif: client.nif.trim() || undefined,
      clientAddress: client.address.trim() || undefined,
      metadata: buildMetadata(def, values, sections),
      clauseIds,
      priceItems: priceItems.map((p, i) => ({
        phaseName: p.phaseName.trim(),
        deliverable: p.deliverable.trim(),
        days: Math.round(Number(p.days) || 0),
        valueKz: Number(p.valueKz) || 0,
        order: i,
      })),
    };
  }

  async function preview() {
    const problem = validate();
    if (problem) return void toast.error(problem);
    setRendering(true);
    try {
      const body = payload();
      const blob = await documentsService.renderLivePdfBlob({
        ...body,
        client: {
          name: client.name.trim() || "Cliente",
          tradeName: client.name.trim() || "Cliente",
          nif: client.nif.trim() || "—",
          address: client.address.trim() || undefined,
          city: "Luanda",
          country: "Angola",
        },
      });
      if (pdfRef.current) URL.revokeObjectURL(pdfRef.current);
      const url = URL.createObjectURL(blob);
      pdfRef.current = url;
      setPdfUrl(url);
      setTab("preview");
    } catch (err) {
      toast.error(errorText(err, "Não foi possível gerar a pré-visualização."));
    } finally {
      setRendering(false);
    }
  }

  const save = useMutation({
    mutationFn: async () => {
      const problem = validate();
      if (problem) throw new Error(problem);
      const body = payload();
      if (editing) {
        const { type: _type, code: _code, ...rest } = body;
        return documentsService.updateDocument(documentId as string, rest);
      }
      return documentsService.createDocument(body);
    },
    onSuccess: () => {
      toast.success(editing ? `${typeConfig.name} actualizado` : `${typeConfig.name} guardado`);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      router.push(`/documents/${typeConfig.slug}`);
    },
    onError: (err) => toast.error(errorText(err, `Não foi possível guardar ${typeConfig.contractedArticle} ${typeConfig.name.toLowerCase()}.`)),
  });

  function renderField(f: FormField) {
    const value = values[f.key] ?? "";
    const label = f.required ? `${f.label} *` : f.label;
    if (f.kind === "textarea") {
      return (
        <Textarea
          key={f.key}
          label={label}
          rows={f.rows ?? 3}
          value={value}
          placeholder={f.placeholder}
          onChange={(e) => setValue(f.key, e.target.value)}
        />
      );
    }
    if (f.kind === "select") {
      return (
        <SelectField
          key={f.key}
          label={label}
          value={value || f.options?.[0]?.value}
          options={f.options ?? []}
          onValueChange={(v) => setValue(f.key, v)}
        />
      );
    }
    return (
      <Input
        key={f.key}
        label={label}
        type={f.kind === "number" ? "number" : "text"}
        hint={f.hint}
        placeholder={f.placeholder}
        value={value}
        onChange={(e) => setValue(f.key, e.target.value)}
      />
    );
  }

  const header = (
    <TitleList
      title={editing ? `Editar ${typeConfig.singularName}` : typeConfig.emitLabel}
      suTitle="Preencha os campos, veja o PDF e guarde. O documento usa o modelo oficial da Mindware."
    >
      <Button variant="outline" onClick={() => router.push(`/documents/${typeConfig.slug}`)}>
        Cancelar
      </Button>
      <Button variant="secondary" disabled={rendering} onClick={() => void preview()}>
        <Icon name={rendering ? "LoaderCircle" : "Eye"} />
        {rendering ? "A gerar..." : "Pré-visualizar"}
      </Button>
      <Button disabled={save.isPending} onClick={() => save.mutate()}>
        <Icon name="Save" />
        {save.isPending ? "A guardar..." : "Guardar"}
      </Button>
    </TitleList>
  );

  return (
    <PageWrapper
      routePath={`/documents/${typeConfig.slug}`}
      routeLabel={typeConfig.pluralName}
      subRoute={editing ? "Editar" : typeConfig.newLabel}
    >
      {header}

      {editing && loaded.isLoading ? (
        <ListSkeleton cols={3} rows={4} />
      ) : editing && loaded.isError ? (
        <RequestError refetch={() => void loaded.refetch()} message="Não foi possível carregar o documento." />
      ) : (
        <Tabs value={tab} onValueChange={(v) => setTab(v as "form" | "preview")}>
          <TabsList>
            <TabsTrigger value="form">Formulário</TabsTrigger>
            <TabsTrigger value="preview" disabled={!pdfUrl}>
              Pré-visualização
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <FormSection icon="FileText" title="Identificação" columns={2}>
              <Input label="Código" value={code} disabled={editing} onChange={(e) => setCode(e.target.value)} />
              <Input label="Título *" value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormSection>

            {def.client && (
              <FormSection icon="Building2" title={def.client.title} description={def.client.description} columns={2}>
                <Input
                  label={`${def.client.nameLabel} *`}
                  value={client.name}
                  onChange={(e) => setClient((c) => ({ ...c, name: e.target.value }))}
                />
                {def.client.showNif && (
                  <Input
                    label={def.client.nifRequired ? `${def.client.nifLabel} *` : def.client.nifLabel}
                    value={client.nif}
                    onChange={(e) => setClient((c) => ({ ...c, nif: e.target.value }))}
                  />
                )}
                {def.client.showAddress && (
                  <Input
                    label="Morada"
                    value={client.address}
                    onChange={(e) => setClient((c) => ({ ...c, address: e.target.value }))}
                  />
                )}
              </FormSection>
            )}

            {def.sections.map((s) => (
              <FormSection key={s.title} icon={s.icon} title={s.title} description={s.description} columns={s.columns ?? 2}>
                {s.fields.map(renderField)}
              </FormSection>
            ))}

            {def.priceTable && (
              <FormSection
                icon="Banknote"
                title="Tabela de preços"
                description="Opcional. Aparece na cláusula de preço com o total."
                columns={2}
              >
                {priceItems.map((p, i) => (
                  <FormSection key={i} icon="ListTodo" title={`Item ${i + 1}`} columns={2}>
                    <Input
                      label="Fase *"
                      value={p.phaseName}
                      onChange={(e) => setPriceItems((l) => l.map((x, j) => (j === i ? { ...x, phaseName: e.target.value } : x)))}
                    />
                    <Input
                      label="Entregável *"
                      value={p.deliverable}
                      onChange={(e) => setPriceItems((l) => l.map((x, j) => (j === i ? { ...x, deliverable: e.target.value } : x)))}
                    />
                    <Input
                      label="Prazo (dias)"
                      type="number"
                      value={String(p.days)}
                      onChange={(e) => setPriceItems((l) => l.map((x, j) => (j === i ? { ...x, days: Number(e.target.value) } : x)))}
                    />
                    <Input
                      label="Valor (Kz)"
                      type="number"
                      value={String(p.valueKz)}
                      onChange={(e) => setPriceItems((l) => l.map((x, j) => (j === i ? { ...x, valueKz: Number(e.target.value) } : x)))}
                    />
                    <Button variant="outline" size="sm" onClick={() => setPriceItems((l) => l.filter((_, j) => j !== i))}>
                      <Icon name="Trash2" />
                      Remover item
                    </Button>
                  </FormSection>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setPriceItems((l) => [...l, { phaseName: "", deliverable: "", days: 0, valueKz: 0 }])}
                >
                  <Icon name="CirclePlus" />
                  Adicionar item
                </Button>
              </FormSection>
            )}

            {def.clauseLibrary && (
              <FormSection icon="Layers" title="Cláusulas da biblioteca" description="Entram depois das cláusulas adicionais." columns={1}>
                <MultiSelect
                  label="Cláusulas"
                  placeholder="Seleccionar cláusulas"
                  isLoading={clauses.isLoading}
                  options={clauseOptions}
                  value={clauseOptions.filter((o) => clauseIds.includes(o.value))}
                  onChange={(opts) => setClauseIds(opts.map((o) => o.value))}
                />
              </FormSection>
            )}

            {def.freeSections && (
              <FormSection icon="ListPlus" title={def.freeSections.title} description={def.freeSections.description} columns={1}>
                {sections.map((s, i) => (
                  <FormSection key={i} icon="Heading" title={`${i + 1}.`} columns={1}>
                    <Input
                      label={def.freeSections?.titleLabel}
                      value={s.title}
                      onChange={(e) => setSections((l) => l.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                    />
                    <Textarea
                      label={def.freeSections?.bodyLabel}
                      rows={4}
                      value={s.body}
                      onChange={(e) => setSections((l) => l.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))}
                    />
                    <Button variant="outline" size="sm" onClick={() => setSections((l) => l.filter((_, j) => j !== i))}>
                      <Icon name="Trash2" />
                      Remover
                    </Button>
                  </FormSection>
                ))}
                <Button variant="outline" onClick={() => setSections((l) => [...l, { title: "", body: "" }])}>
                  <Icon name="CirclePlus" />
                  {def.freeSections.addLabel}
                </Button>
              </FormSection>
            )}
          </TabsContent>

          <TabsContent value="preview">
            {pdfUrl && <iframe title="Pré-visualização do PDF" src={pdfUrl} width="100%" height="900" />}
          </TabsContent>
        </Tabs>
      )}
    </PageWrapper>
  );
}
