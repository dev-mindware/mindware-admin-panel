import { cn } from "@workspace/utils";

export { cn };

export function formatKwanza(val: number | string): string {
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "0,00 Kz";
  return new Intl.NumberFormat("pt-AO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num) + " Kz";
}
