"use client";

import { AlertCircle, CheckCircle, Calculator, Sparkles } from "lucide-react";
import { Button } from "@workspace/ui";
import { Input } from "@workspace/ui";
import { PaymentMilestone } from "@/services/documents-service";
import { formatKwanza } from "@/lib/utils";

interface MilestoneCalculatorProps {
  totalValueKz: number;
  milestones: PaymentMilestone[];
  onChange: (milestones: PaymentMilestone[]) => void;
}

export function MilestoneCalculator({
  totalValueKz,
  milestones,
  onChange,
}: MilestoneCalculatorProps) {
  // Preset 40 / 30 / 30 Mindware
  const applyMindwarePreset = () => {
    onChange([
      {
        name: "Assinatura do contrato (Adiantamento)",
        percentage: 40,
        calculatedKz: Math.round(totalValueKz * 0.4),
        order: 1,
      },
      {
        name: "Entrega de Backend + Frontend (ponto intermédio)",
        percentage: 30,
        calculatedKz: Math.round(totalValueKz * 0.3),
        order: 2,
      },
      {
        name: "Entrega final e aceitação",
        percentage: 30,
        calculatedKz: Math.round(totalValueKz * 0.3),
        order: 3,
      },
    ]);
  };

  // Preset 50 / 50
  const applyHalfHalfPreset = () => {
    onChange([
      {
        name: "Assinatura do contrato e início dos trabalhos",
        percentage: 50,
        calculatedKz: Math.round(totalValueKz * 0.5),
        order: 1,
      },
      {
        name: "Homologação final e entrega em produção",
        percentage: 50,
        calculatedKz: Math.round(totalValueKz * 0.5),
        order: 2,
      },
    ]);
  };

  const updatePercentage = (index: number, newPercent: number) => {
    const next = [...milestones];
    const val = Number(newPercent) || 0;
    next[index] = {
      ...next[index],
      percentage: val,
      calculatedKz: Math.round((totalValueKz * val) / 100),
    };
    onChange(next);
  };

  const updateName = (index: number, name: string) => {
    const next = [...milestones];
    next[index] = { ...next[index], name };
    onChange(next);
  };

  const totalPercentage = milestones.reduce(
    (acc, m) => acc + (Number(m.percentage) || 0),
    0
  );
  const isValid = Math.abs(totalPercentage - 100) < 0.01;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <Calculator className="h-4 w-4 text-[#D85A38]" />
            Marcos Financeiros de Pagamento
          </h4>
          <p className="text-xs text-stone-500">
            Distribuição percentual baseada no valor total da proposta ({formatKwanza(totalValueKz)}).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-stone-400">Presets:</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyMindwarePreset}
            className="text-xs h-8 gap-1"
          >
            <Sparkles className="h-3 w-3 text-[#D85A38]" />
            40% / 30% / 30%
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyHalfHalfPreset}
            className="text-xs h-8"
          >
            50% / 50%
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F3] border-b border-stone-200/80 text-stone-600 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-3 w-1/2">Designação do Marco</th>
              <th className="p-3 w-28 text-center">% Percentagem</th>
              <th className="p-3 text-right">Valor Calculado (Kz)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {milestones.map((m, idx) => (
              <tr key={idx} className="hover:bg-stone-50/60 transition-colors">
                <td className="p-2.5">
                  <Input
                    value={m.name}
                    onChange={(e) => updateName(idx, e.target.value)}
                    className="h-9 text-xs"
                  />
                </td>
                <td className="p-2.5">
                  <div className="relative flex items-center">
                    <Input
                      type="number"
                      step="0.1"
                      value={m.percentage}
                      onChange={(e) => updatePercentage(idx, parseFloat(e.target.value))}
                      className="h-9 text-xs text-center font-mono pr-6"
                    />
                    <span className="absolute right-2 text-stone-400 font-bold text-xs">%</span>
                  </div>
                </td>
                <td className="p-2.5 text-right font-mono font-bold text-stone-900">
                  {formatKwanza(m.calculatedKz)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-[#FAF8F3]/80 border-t border-stone-200/80 font-bold text-stone-900">
            <tr>
              <td className="p-3 text-stone-700">Somatório dos Marcos</td>
              <td className="p-3 text-center">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-mono font-bold ${
                    isValid
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {isValid ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  {totalPercentage.toFixed(1)}%
                </span>
              </td>
              <td className="p-3 text-right font-mono text-sm text-[#D85A38]">
                {formatKwanza(
                  milestones.reduce((acc, m) => acc + Number(m.calculatedKz || 0), 0)
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {!isValid && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50/80 border border-amber-200 p-3 text-xs text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            Atenção: A soma das percentagens deve totalizar exatamente 100% para emissão formal da proposta.
          </span>
        </div>
      )}
    </div>
  );
}
