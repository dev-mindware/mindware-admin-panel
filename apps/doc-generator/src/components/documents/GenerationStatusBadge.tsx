import React from "react";
import { Badge, Icon } from "@workspace/ui";

interface Props {
  status: "DRAFT" | "GENERATING" | "GENERATED" | "FAILED" | string;
}

export function GenerationStatusBadge({ status }: Props) {
  switch (status) {
    case "GENERATED":
      return (
        <Badge variant="success" className="gap-1 font-semibold">
          <Icon name="CircleCheck" size={12} />
          <span>Pronto</span>
        </Badge>
      );
    case "GENERATING":
      return (
        <Badge variant="pending" className="gap-1 font-semibold">
          <Icon name="LoaderCircle" size={12} className="animate-spin" />
          <span>A Gerar PDF</span>
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="destructive" className="gap-1 font-semibold">
          <Icon name="TriangleAlert" size={12} />
          <span>Falha</span>
        </Badge>
      );
    case "DRAFT":
    default:
      return (
        <Badge variant="secondary" className="gap-1 font-semibold">
          <Icon name="Clock" size={12} />
          <span>Rascunho</span>
        </Badge>
      );
  }
}