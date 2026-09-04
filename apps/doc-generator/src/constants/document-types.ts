import { icons } from "lucide-react";

export interface DocumentTypeConfig {
  slug: string;
  name: string;
  pluralName: string;
  singularName: string;
  description: string;
  icon: keyof typeof icons;
  badgeLabel: string;
  prefix: string;
  category: string;
  defaultDeliverableDays: number;
}

export const DOCUMENT_TYPES: DocumentTypeConfig[] = [
  {
    slug: "proposal",
    name: "Proposta",
    pluralName: "Propostas Comerciais",
    singularName: "Proposta Comercial",
    description: "Propostas de prestação de serviços, orçamentos e escopos de trabalho.",
    icon: "ScrollText",
    badgeLabel: "Proposta",
    prefix: "PROP",
    category: "Comercial",
    defaultDeliverableDays: 30,
  },
  {
    slug: "contract",
    name: "Contrato",
    pluralName: "Contratos Oficiais",
    singularName: "Contrato de Prestação de Serviços",
    description: "Contratos bilaterais, acordos de nível de serviço (SLA) e termos vinculativos.",
    icon: "FileCheck",
    badgeLabel: "Contrato",
    prefix: "CONT",
    category: "Jurídico",
    defaultDeliverableDays: 60,
  },
  {
    slug: "letter",
    name: "Carta",
    pluralName: "Cartas Formais",
    singularName: "Carta Formal",
    description: "Comunicações institucionais, cartas de apresentação e manifestações de interesse.",
    icon: "Mail",
    badgeLabel: "Carta",
    prefix: "CART",
    category: "Institucional",
    defaultDeliverableDays: 15,
  },
  {
    slug: "opinion",
    name: "Parecer",
    pluralName: "Pareceres Técnicos",
    singularName: "Parecer Técnico",
    description: "Avaliações técnicas, diagnósticos de arquitetura e pareceres fundamentados.",
    icon: "FileCheck2",
    badgeLabel: "Parecer",
    prefix: "PARC",
    category: "Técnico",
    defaultDeliverableDays: 20,
  },
  {
    slug: "official",
    name: "Ofício",
    pluralName: "Ofícios Institucionais",
    singularName: "Ofício Institucional",
    description: "Correspondências oficiais entre órgãos públicos, ministérios e empresas.",
    icon: "Stamp",
    badgeLabel: "Ofício",
    prefix: "OFIC",
    category: "Institucional",
    defaultDeliverableDays: 15,
  },
  {
    slug: "nda",
    name: "Acordo de Confidencialidade (NDA)",
    pluralName: "Acordos de Confidencialidade (NDA)",
    singularName: "Acordo de Confidencialidade",
    description: "Termos de sigilo, protecção de propriedade intelectual e dados estratégicos.",
    icon: "ShieldAlert",
    badgeLabel: "NDA",
    prefix: "NDA",
    category: "Jurídico",
    defaultDeliverableDays: 365,
  },
];

export function getDocumentTypeBySlug(slug: string): DocumentTypeConfig | undefined {
  return DOCUMENT_TYPES.find((d) => d.slug === slug);
}
