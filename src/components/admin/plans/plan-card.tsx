"use client";

import { Card, CardContent, CardHeader, CardTitle, Icon, Button } from "@/components";
import { Plan } from "@/types/plan";
import { cn } from "@/lib/utils";
import { Check, X, Users, Store, Edit, Trash2 } from "lucide-react";

interface PlanCardProps {
    plan: Plan;
    onEdit?: (plan: Plan) => void;
    onDelete?: (plan: Plan) => void;
}

export function PlanCard({ plan, onEdit, onDelete }: PlanCardProps) {
    const features = [
        { label: "POS", enabled: plan.features.hasPos },
        { label: "Exportar SAFT", enabled: plan.features.canExportSaft },
        { label: "Gestão de Stock", enabled: plan.features.hasStock },
        { label: "Faturação", enabled: plan.features.hasInvoices },
        { label: "Relatórios", enabled: plan.features.hasReporting },
        { label: "Fornecedores", enabled: plan.features.hasSuppliers },
    ];

    return (
        <Card className="flex flex-col h-full overflow-hidden border shadow-none bg-gradient-to-t from-primary/2 to-card relative group transition-all hover:border-primary/40">
            {!plan.isPublic && (
                <div className="absolute top-3 right-3 bg-muted text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border">
                    Privado
                </div>
            )}

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-1">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                        <Icon name="Trophy" className="w-5 h-5" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={() => onEdit(plan)}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => onDelete(plan)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-primary">
                        {Number(plan.priceMonthly).toLocaleString("pt-PT", {
                            style: "currency",
                            currency: "AOA",
                        })}
                    </span>
                    <span className="text-muted-foreground text-xs font-medium">/mês</span>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col pt-0 pb-6">
                <div className="space-y-4 mt-4">
                    {/* Limits section */}
                    <div className="grid grid-cols-2 gap-3 pb-4 border-b">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-sm bg-muted text-muted-foreground">
                                <Users className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Utilizadores</span>
                                <span className="text-sm font-bold">{plan.maxUsers}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-sm bg-muted text-muted-foreground">
                                <Store className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Lojas</span>
                                <span className="text-sm font-bold">
                                    {plan.maxStores === -1 ? "Ilimitado" : plan.maxStores}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2.5">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Funcionalidades</span>
                        <ul className="space-y-2">
                            {features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm">
                                    {feature.enabled ? (
                                        <div className="bg-primary/20 rounded-full p-0.5">
                                            <Check className="w-3 h-3 text-primary" />
                                        </div>
                                    ) : (
                                        <div className="bg-muted rounded-full p-0.5">
                                            <X className="w-3 h-3 text-muted-foreground/40" />
                                        </div>
                                    )}
                                    <span className={cn(
                                        "font-medium",
                                        feature.enabled ? "text-foreground" : "text-muted-foreground/60 line-through decoration-muted-foreground/30"
                                    )}>
                                        {feature.label}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {plan.trialPeriodInDays && (
                    <div className="mt-auto pt-6">
                        <div className="bg-primary/5 border border-primary/10 rounded-md p-3 text-center">
                            <p className="text-xs text-primary font-bold">
                                {plan.trialPeriodInDays} dias de trial gratuito
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
