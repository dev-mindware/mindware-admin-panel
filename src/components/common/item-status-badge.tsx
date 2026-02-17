import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { SubscriptionStatus } from "@/types/subscription";

interface ItemStatusBadgeProps {
    status: SubscriptionStatus | "ACTIVE" | "INACTIVE" | string;
    className?: string;
}

const statusConfig: Record<string, { label: string; variant: "success" | "destructive" | "pending" | "secondary" }> = {
    ACTIVE: {
        label: "Ativo",
        variant: "success",
    },
    CANCELLED: {
        label: "Cancelado",
        variant: "destructive",
    },
    TRIALING: {
        label: "Teste",
        variant: "pending",
    },
    PAST_DUE: {
        label: "Vencido",
        variant: "destructive",
    },
    PENDING: {
        label: "Pendente",
        variant: "pending",
    },
    EXPIRED: {
        label: "Expirado",
        variant: "destructive",
    },
    INACTIVE: {
        label: "Inativo",
        variant: "secondary",
    },
};

export function ItemStatusBadge({ status, className }: ItemStatusBadgeProps) {
    const config = statusConfig[status] || {
        label: status,
        variant: "secondary",
    };

    return (
        <Badge
            variant={config.variant}
            className={cn("font-medium", className)}
        >
            {config.label}
        </Badge>
    );
}
