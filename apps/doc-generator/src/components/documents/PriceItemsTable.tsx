"use client";

import React from "react";
import { Button } from "@workspace/ui";
import { Input } from "@workspace/ui";
import { Icon } from "@workspace/ui";
import { PriceItem } from "@/services/documents-service";

interface Props {
  items: PriceItem[];
  onChange: (items: PriceItem[]) => void;
}

export function PriceItemsTable({ items, onChange }: Props) {
  const handleAddItem = () => {
    onChange([
      ...items,
      {
        phaseName: "",
        deliverable: "",
        days: 5,
        valueKz: 0,
        order: items.length + 1,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, idx) => idx !== index));
  };

  const handleUpdateItem = (
    index: number,
    field: keyof PriceItem,
    val: any
  ) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: val };
    updated[index] = current;
    onChange(updated);
  };

  const total = items.reduce((acc, it) => acc + (Number(it.valueKz) || 0), 0);

  const formatKz = (val: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
    }).format(val);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 border-b text-muted-foreground font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3 w-8">#</th>
              <th className="p-3">Fase / Módulo</th>
              <th className="p-3">Entregáveis Detalhados</th>
              <th className="p-3 w-28 text-center">Prazo (Dias)</th>
              <th className="p-3 w-40 text-right">Valor Total (Kz)</th>
              <th className="p-3 w-16 text-center">Acção</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((it, idx) => (
              <tr key={idx} className="hover:bg-muted/20 transition-colors">
                <td className="p-3 font-mono font-medium text-muted-foreground">
                  {idx + 1}
                </td>
                <td className="p-2">
                  <Input
                    type="text"
                    placeholder="Ex: Fase 1 - Discovery e Arquitetura..."
                    value={it.phaseName}
                    onChange={(e) =>
                      handleUpdateItem(idx, "phaseName", e.target.value)
                    }
                    className="h-8 text-xs bg-background"
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="text"
                    placeholder="Ex: Diagramas, Protótipo e Base de Dados..."
                    value={it.deliverable}
                    onChange={(e) =>
                      handleUpdateItem(idx, "deliverable", e.target.value)
                    }
                    className="h-8 text-xs bg-background"
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    min={1}
                    value={it.days}
                    onChange={(e) =>
                      handleUpdateItem(idx, "days", Number(e.target.value))
                    }
                    className="h-8 text-xs text-center bg-background"
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    min={0}
                    value={it.valueKz}
                    onChange={(e) =>
                      handleUpdateItem(idx, "valueKz", Number(e.target.value))
                    }
                    className="h-8 text-xs text-right bg-background"
                  />
                </td>
                <td className="p-2 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(idx)}
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer"
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/30 font-bold border-t">
            <tr>
              <td colSpan={4} className="p-3 text-right text-xs text-muted-foreground">
                Total Geral da Proposta:
              </td>
              <td className="p-3 text-right font-mono text-sm text-primary">
                {formatKz(total)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddItem}
        className="gap-2 cursor-pointer"
      >
        <Icon name="Plus" size={14} />
        <span>Adicionar Item de Preço</span>
      </Button>
    </div>
  );
}
