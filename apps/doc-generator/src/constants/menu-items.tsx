import * as React from "react";
import { Icon } from "@workspace/ui";
import { DOCUMENT_TYPES } from "./document-types";

export type MenuItem = {
  name: string;
  url: string;
  icon?: React.ReactNode;
  showMoreIcon?: boolean;
  items?: MenuItem[];
};

export type MenuStructure = {
  items: MenuItem[];
};

export const adminMenuItems: MenuStructure = {
  items: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: <Icon name="LayoutDashboard" />,
    },
    {
      name: "Documentos",
      url: "#",
      icon: <Icon name="ScrollText" />,
      items: DOCUMENT_TYPES.map((dt) => ({
        name: dt.name,
        url: `/documents/${dt.slug}`,
      })),
    },
    {
      name: "Clientes",
      url: "/clients",
      icon: <Icon name="Users" />,
    },
    {
      name: "Biblioteca de Cláusulas",
      url: "/clauses",
      icon: <Icon name="Layers" />,
    },
  ],
};
