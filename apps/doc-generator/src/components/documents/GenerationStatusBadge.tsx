import React from "react";
import { Badge, Icon } from "@workspace/ui";

interface Props {
  status:
    | "DRAFT"
    | "PENDING_APPROVAL"
    | "APPROVED"
    | "REJECTED"
    | "GENERATING"
    | "GENERATED"
    | "FAILED"
    | string;
  className?: string;
}

export function GenerationStatusBadge({ status, className }: Props) {
  switch (status) {
    case "APPROVED":
      return (
        <Badge variant="success" className={`gap-1 font-semibold ${className || ""}`}>
          <Icon name="CheckCheck" size={12} />
          <span>Aprovado</span>
        </Badge>
      );
    case "PENDING_APPROVAL":
      return (
        <Badge
          variant="outline"
          className={`gap-1 font-semibold text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 ${className || ""}`}
        >
          <Icon name="Clock" size={12} />
          <span>Pendente Aprovação</span>
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="destructive" className={`gap-1 font-semibold ${className || ""}`}>
          <Icon name="CircleX" size={12} />
          <span>Rejeitado</span>
        </Badge>
      );
    case "GENERATED":
      return (
        <Badge variant="success" className={`gap-1 font-semibold ${className || ""}`}>
          <Icon name="CircleCheck" size={12} />
          <span>Emitido</span>
        </Badge>
      );
    case "GENERATING":
      return (
        <Badge variant="pending" className={`gap-1 font-semibold ${className || ""}`}>
          <Icon name="LoaderCircle" size={12} className="animate-spin" />
          <span>A Gerar PDF</span>
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="destructive" className={`gap-1 font-semibold ${className || ""}`}>
          <Icon name="TriangleAlert" size={12} />
          <span>Falha</span>
        </Badge>
      );
    case "DRAFT":
    default:
      return (
        <Badge variant="secondary" className={`gap-1 font-semibold ${className || ""}`}>
          <Icon name="FilePenLine" size={12} />
          <span>Rascunho</span>
        </Badge>
      );
  }
}