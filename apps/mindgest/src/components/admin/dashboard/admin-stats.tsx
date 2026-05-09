// import { CardStat } from "@/components/clients";
import { Stats } from "@/types";

export function AdminStatsCards() {
  /*   const { stats, isLoading, error, refetch } = useAffiliatedStats();

  if (isLoading) return <StatsCardsSkeleton />;
  if (error) return <RequestError refetch={refetch} />;
 */

  const adminStats: Stats[] = [
    {
      title: "Usuários",
      value: 256,
      icon: "Users",
      description: "Usuários ativos na plataforma",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Empresas",
      value: "42",
      icon: "Building2",
      description: "Empresas cadastradas",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Assinantes",
      value: "120",
      icon: "CreditCard",
      description: "Clientes com assinatura ativa",
      color: "text-primary-500",
      bgColor: "bg-primary-50",
    },
    {
      title: "Faturamento",
      value: "45.000,00 Kz",
      icon: "TrendingUp",
      description: "Receita total este mês",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {adminStats.map((stat) => {
        return null;
      })}
    </div>
  );
}
