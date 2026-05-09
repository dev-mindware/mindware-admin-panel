import { Badge } from "../ui/badge";
import { cn } from "@workspace/utils";

interface ItemStatusBadgeProps {
    status: string;
    className?: string;
}

const statusConfig: Record<string, { label: string; variant: "success" | "destructive" | "pending" | "secondary" | "default" | "outline" }> = {
    // Affiliate & General Status
    active: { label: "Ativo", variant: "success" },
    ACTIVE: { label: "Ativo", variant: "success" },
    
    inactive: { label: "Inativo", variant: "secondary" },
    INACTIVE: { label: "Inativo", variant: "secondary" },
    
    pending_approval: { label: "Pendente de Aprovação", variant: "pending" },
    PENDING_APPROVAL: { label: "Pendente de Aprovação", variant: "pending" },
    
    suspended: { label: "Suspenso", variant: "destructive" },
    SUSPENDED: { label: "Suspenso", variant: "destructive" },
    
    rejected: { label: "Rejeitado", variant: "destructive" },
    REJECTED: { label: "Rejeitado", variant: "destructive" },

    // Commission & Withdrawal Status
    pending: { label: "Pendente", variant: "pending" },
    PENDING: { label: "Pendente", variant: "pending" },
    
    approved: { label: "Aprovado", variant: "success" },
    APPROVED: { label: "Aprovado", variant: "success" },
    
    paid: { label: "Pago", variant: "success" },
    PAID: { label: "Pago", variant: "success" },

    // Lead Status (as fallback or if used here)
    new: { label: "Novo", variant: "secondary" },
    contacted: { label: "Contactado", variant: "default" },
    converted: { label: "Convertido", variant: "outline" },
    lost: { label: "Perdido", variant: "destructive" },

    // Subscription Status
    trialing: { label: "Teste", variant: "pending" },
    TRIALING: { label: "Teste", variant: "pending" },
    
    past_due: { label: "Vencido", variant: "destructive" },
    PAST_DUE: { label: "Vencido", variant: "destructive" },
    
    expired: { label: "Expirado", variant: "destructive" },
    EXPIRED: { label: "Expirado", variant: "destructive" },
};

export function ItemStatusBadge({ status, className }: ItemStatusBadgeProps) {
    const config = statusConfig[status] || {
        label: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        variant: "secondary",
    };

    return (
        <Badge
            variant={config.variant as any}
            className={cn("font-medium", className)}
        >
            {config.label}
        </Badge>
    );
}
