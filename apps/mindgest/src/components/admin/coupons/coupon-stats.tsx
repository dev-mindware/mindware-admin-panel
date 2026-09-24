"use client";

import { CouponStats as CouponStatsType } from "@/types/coupon";
import { Icon, Skeleton } from "@/components";
import { formatCurrency } from "@/utils";

interface CouponStatsProps {
  stats?: CouponStatsType;
  isLoading?: boolean;
}

export function CouponStats({ stats, isLoading }: CouponStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const items = [
    {
      title: "Total de Cupões",
      value: stats?.totalCoupons || 0,
      icon: "Ticket" as const,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      description: "Cupões cadastrados no sistema",
    },
    {
      title: "Cupões Ativos",
      value: stats?.activeCoupons || 0,
      icon: "CircleCheck" as const,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      description: "Prontos para utilização",
    },
    {
      title: "Total de Resgates",
      value: stats?.totalUsages || 0,
      icon: "Award" as const,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      description: "Utilizações em subscrições",
    },
    {
      title: "Desconto Concedido",
      value: formatCurrency(stats?.totalDiscountAmount || 0),
      icon: "Coins" as const,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      description: "Economia total proporcionada",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex flex-col justify-between p-5 rounded-xl border bg-card text-card-foreground shadow-xs hover:border-primary/20 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {item.title}
            </span>
            <div className={`p-2 rounded-lg ${item.bg}`}>
              <Icon name={item.icon as any} className={`w-4 h-4 ${item.color}`} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight">{item.value}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
