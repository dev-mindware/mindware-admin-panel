/**
 * Formulários dos documentos de texto, por tipo. Cada campo grava em
 * `metadata` (as chaves com ponto criam objectos: `firstSignatory.name`).
 * Têm de coincidir com o que a API lê em `document-context.ts`.
 */
import type { icons } from "lucide-react";

export type FieldKind = "text" | "textarea" | "select" | "number";

export interface FormField {
  key: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  rows?: number;
  options?: { value: string; label: string }[];
}

export interface FormSectionDef {
  title: string;
  description?: string;
  icon: keyof typeof icons;
  columns?: 1 | 2;
  fields: FormField[];
}

export interface ClientBlock {
  title: string;
  description: string;
  nameLabel: string;
  nifLabel: string;
  showNif: boolean;
  nifRequired: boolean;
  showAddress: boolean;
}

export interface TypeFormDef {
  /** Sem bloco de cliente (a declaração identifica o colaborador). */
  client: ClientBlock | null;
  sections: FormSectionDef[];
  /** Secções livres (título + texto): cláusulas acrescentadas ou capítulos da análise. */
  freeSections?: { title: string; description: string; addLabel: string; titleLabel: string; bodyLabel: string };
  /** Tabela de preços (contrato). */
  priceTable?: boolean;
  /** Cláusulas da biblioteca (contrato). */
  clauseLibrary?: boolean;
  defaults: Record<string, string | number>;
}

const SIGNATORIES: FormSectionDef = {
  title: "Assinaturas",
  description: "Quem assina por cada parte. Pode ficar em branco.",
  icon: "PenLine",
  columns: 2,
  fields: [
    { key: "firstSignatory.name", label: "Pela Mindware (nome)", kind: "text", placeholder: "Ex: João Silva" },
    { key: "firstSignatory.role", label: "Pela Mindware (cargo)", kind: "text", placeholder: "Ex: Director Geral" },
    { key: "secondSignatory.name", label: "Pela outra parte (nome)", kind: "text" },
    { key: "secondSignatory.role", label: "Pela outra parte (cargo)", kind: "text" },
  ],
};

const SENDER: FormSectionDef = {
  title: "Remetente e data",
  icon: "PenLine",
  columns: 2,
  fields: [
    { key: "senderName", label: "Assina (nome)", kind: "text", required: true, placeholder: "Ex: João Silva" },
    { key: "senderRole", label: "Cargo", kind: "text", placeholder: "Ex: Director Geral" },
    { key: "city", label: "Cidade", kind: "text" },
    { key: "emissionDate", label: "Data por extenso", kind: "text" },
  ],
};

const CORRESPONDENCE: Pick<TypeFormDef, "sections" | "freeSections"> = {
  sections: [
    {
      title: "Destinatário",
      description: "A entidade destinatária preenche-se acima; aqui vai a pessoa e o tratamento.",
      icon: "UserRound",
      columns: 2,
      fields: [
        { key: "recipientName", label: "Nome do destinatário", kind: "text", placeholder: "Ex: Dra. Ana Lopes" },
        { key: "recipientRole", label: "Cargo", kind: "text", placeholder: "Ex: Directora Financeira" },
        { key: "salutation", label: "Saudação", kind: "text", placeholder: "Ex: Exmo(a). Senhor(a)," },
      ],
    },
    {
      title: "Conteúdo",
      icon: "FileText",
      columns: 1,
      fields: [
        { key: "subject", label: "Assunto", kind: "text", required: true },
        { key: "reference", label: "Referência", kind: "text", placeholder: "Ex: V/Ref. 123/2026" },
        { key: "body", label: "Texto", kind: "textarea", required: true, rows: 10, hint: "Uma linha em branco separa os parágrafos." },
        { key: "closing", label: "Fecho", kind: "text", placeholder: "Com os melhores cumprimentos," },
        { key: "copyTo", label: "Com cópia para", kind: "text" },
      ],
    },
    SENDER,
  ],
};

export const DOCUMENT_FORMS: Record<string, TypeFormDef> = {
  contract: {
    client: {
      title: "Segundo Outorgante",
      description: "A outra parte do contrato. O Primeiro Outorgante é a Mindware.",
      nameLabel: "Denominação",
      nifLabel: "NIF",
      showNif: true,
      nifRequired: true,
      showAddress: true,
    },
    sections: [
      {
        title: "Objecto e prazo",
        icon: "ScrollText",
        columns: 2,
        fields: [
          { key: "objectText", label: "Objecto do contrato", kind: "textarea", rows: 4, hint: "Descreva o serviço. Sem texto, usa-se uma formulação-base." },
          { key: "term", label: "Prazo", kind: "text", placeholder: "12 (doze) meses" },
          { key: "startDate", label: "Início", kind: "text", placeholder: "Ex: 01 de Novembro de 2026" },
        ],
      },
      {
        title: "Pagamento e cessação",
        icon: "Banknote",
        columns: 2,
        fields: [
          { key: "paymentTerms", label: "Condições de pagamento", kind: "textarea", rows: 3, hint: "Complementa a tabela de preços abaixo." },
          { key: "noticeDays", label: "Pré-aviso de denúncia (dias)", kind: "number", placeholder: "30" },
          { key: "confidentialityYears", label: "Sigilo após o termo (anos)", kind: "number", placeholder: "5" },
          { key: "jurisdiction", label: "Foro (comarca)", kind: "text", placeholder: "Luanda" },
        ],
      },
      SIGNATORIES,
      {
        title: "Data",
        icon: "CalendarDays",
        columns: 2,
        fields: [
          { key: "city", label: "Cidade", kind: "text" },
          { key: "emissionDate", label: "Data por extenso", kind: "text" },
        ],
      },
    ],
    freeSections: {
      title: "Cláusulas adicionais",
      description: "Numeradas a seguir às cláusulas-base (a 10.ª em diante).",
      addLabel: "Adicionar cláusula",
      titleLabel: "Título da cláusula",
      bodyLabel: "Texto",
    },
    priceTable: true,
    clauseLibrary: true,
    defaults: { term: "12 (doze) meses", noticeDays: 30, confidentialityYears: 5, jurisdiction: "Luanda" },
  },

  nda: {
    client: {
      title: "Segundo Outorgante",
      description: "A outra parte do acordo. O Primeiro Outorgante é a Mindware.",
      nameLabel: "Denominação",
      nifLabel: "NIF",
      showNif: true,
      nifRequired: true,
      showAddress: true,
    },
    sections: [
      {
        title: "Acordo",
        icon: "ShieldAlert",
        columns: 2,
        fields: [
          {
            key: "mutual",
            label: "Tipo de acordo",
            kind: "select",
            options: [
              { value: "false", label: "Unilateral (só a Mindware divulga)" },
              { value: "true", label: "Mútuo (ambas divulgam)" },
            ],
          },
          { key: "purpose", label: "Finalidade da divulgação", kind: "textarea", rows: 3, hint: "Sem texto, usa-se «avaliação e negociação de uma eventual relação comercial»." },
          { key: "termYears", label: "Duração do acordo (anos)", kind: "number", placeholder: "2" },
          { key: "confidentialityYears", label: "Sigilo após o termo (anos)", kind: "number", placeholder: "5" },
          { key: "jurisdiction", label: "Foro (comarca)", kind: "text", placeholder: "Luanda" },
        ],
      },
      SIGNATORIES,
      {
        title: "Data",
        icon: "CalendarDays",
        columns: 2,
        fields: [
          { key: "city", label: "Cidade", kind: "text" },
          { key: "emissionDate", label: "Data por extenso", kind: "text" },
        ],
      },
    ],
    freeSections: {
      title: "Cláusulas adicionais",
      description: "Numeradas a seguir às cláusulas-base, antes da lei aplicável e foro.",
      addLabel: "Adicionar cláusula",
      titleLabel: "Título da cláusula",
      bodyLabel: "Texto",
    },
    defaults: { mutual: "false", termYears: 2, confidentialityYears: 5, jurisdiction: "Luanda" },
  },

  letter: {
    client: {
      title: "Entidade destinatária",
      description: "Aparece no endereçamento da carta.",
      nameLabel: "Entidade",
      nifLabel: "NIF (opcional)",
      showNif: true,
      nifRequired: false,
      showAddress: true,
    },
    ...CORRESPONDENCE,
    defaults: { salutation: "Exmo(a). Senhor(a),", closing: "Com os melhores cumprimentos," },
  },

  official: {
    client: {
      title: "Entidade destinatária",
      description: "Órgão ou entidade a quem o ofício é dirigido.",
      nameLabel: "Entidade",
      nifLabel: "NIF (opcional)",
      showNif: true,
      nifRequired: false,
      showAddress: true,
    },
    ...CORRESPONDENCE,
    defaults: { salutation: "Exmo(a). Senhor(a),", closing: "Com os melhores cumprimentos," },
  },

  opinion: {
    client: {
      title: "Requerente",
      description: "Quem pediu o parecer.",
      nameLabel: "Requerente",
      nifLabel: "NIF (opcional)",
      showNif: true,
      nifRequired: false,
      showAddress: false,
    },
    sections: [
      {
        title: "Identificação",
        icon: "ClipboardList",
        columns: 2,
        fields: [
          { key: "subject", label: "Assunto", kind: "text", required: true },
          { key: "reference", label: "Referência", kind: "text", placeholder: "Ex: Pedido n.º 45" },
          { key: "authorName", label: "Autor", kind: "text", required: true, placeholder: "Ex: Eng. Paulo Dias" },
          { key: "authorRole", label: "Cargo do autor", kind: "text", placeholder: "Direcção Técnica" },
        ],
      },
      {
        title: "Resumo e enquadramento",
        icon: "FileText",
        columns: 1,
        fields: [
          { key: "summary", label: "Resumo", kind: "textarea", rows: 3, hint: "Opcional. Aparece em destaque no início." },
          { key: "background", label: "Enquadramento", kind: "textarea", rows: 5 },
        ],
      },
      {
        title: "Conclusão e recomendações",
        icon: "CircleCheck",
        columns: 1,
        fields: [
          { key: "conclusion", label: "Conclusão", kind: "textarea", rows: 4 },
          { key: "recommendations", label: "Recomendações", kind: "textarea", rows: 4, hint: "Uma por linha; saem numeradas." },
          { key: "city", label: "Cidade", kind: "text" },
          { key: "emissionDate", label: "Data por extenso", kind: "text" },
        ],
      },
    ],
    freeSections: {
      title: "Análise",
      description: "Um capítulo por tema; aparecem na secção «2. Análise».",
      addLabel: "Adicionar capítulo",
      titleLabel: "Título do capítulo",
      bodyLabel: "Texto",
    },
    defaults: { authorRole: "Direcção Técnica" },
  },

  declaration: {
    client: null,
    sections: [
      {
        title: "Colaborador",
        description: "O texto adapta-se ao género escolhido.",
        icon: "UserRound",
        columns: 2,
        fields: [
          { key: "workerName", label: "Nome completo", kind: "text", required: true },
          {
            key: "workerGender",
            label: "Género",
            kind: "select",
            options: [
              { value: "M", label: "Masculino" },
              { value: "F", label: "Feminino" },
            ],
          },
          { key: "workerIdNumber", label: "N.º do B.I.", kind: "text" },
          { key: "workerRole", label: "Função", kind: "text", required: true },
          { key: "workerDepartment", label: "Departamento", kind: "text" },
        ],
      },
      {
        title: "Finalidade e emissão",
        icon: "FileText",
        columns: 2,
        fields: [
          { key: "purpose", label: "Para efeitos de", kind: "textarea", rows: 3, hint: "Sem texto, usa-se a finalidade habitual (comprovação de vínculo)." },
          { key: "signatoryRole", label: "Assina", kind: "text", placeholder: "A DIRECÇÃO GERAL" },
          { key: "city", label: "Cidade", kind: "text" },
          { key: "emissionPlace", label: "Local de emissão", kind: "text" },
          { key: "emissionDate", label: "Data por extenso", kind: "text" },
        ],
      },
      {
        title: "Texto próprio",
        description: "Opcional: substitui o texto-padrão da declaração.",
        icon: "TextCursorInput",
        columns: 1,
        fields: [
          { key: "customParagraphs", label: "Parágrafos", kind: "textarea", rows: 8, hint: "Uma linha em branco separa os parágrafos. Texto simples (sem HTML)." },
        ],
      },
    ],
    defaults: {
      workerGender: "M",
      signatoryRole: "A DIRECÇÃO GERAL",
      city: "Luanda",
      emissionPlace: "Luanda, Angola",
    },
  },
};

/** Valor numa estrutura aninhada a partir de uma chave com pontos. */
export function getPath(obj: Record<string, any>, path: string): any {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function setPath(obj: Record<string, any>, path: string, value: unknown): void {
  const keys = path.split(".");
  let cur = obj;
  keys.slice(0, -1).forEach((k) => {
    cur[k] = cur[k] && typeof cur[k] === "object" ? cur[k] : {};
    cur = cur[k];
  });
  cur[keys[keys.length - 1]] = value;
}
