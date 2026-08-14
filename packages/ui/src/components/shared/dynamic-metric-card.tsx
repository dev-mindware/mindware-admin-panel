"use client";

import { Card, CardContent, Icon, Skeleton } from "..";
import { cn } from "@workspace/utils";
import { icons } from "lucide-react";

interface DynamicMetricCardProps {
    title: string | number;
    subtitle: string;
    description?: string;
    icon?: keyof typeof icons;
    variant?: "default" | "action" | "interactive";
    colors?: "default" | "destructive";
    className?: string;
    onClick?: () => void;
}

export function DynamicMetricCard({
    title,
    subtitle,
    description,
    icon,
    variant = "default",
    colors = "default",
    className,
    onClick,
}: DynamicMetricCardProps) {
    const isInteractive = onClick || variant === "interactive" || variant === "action";
    const isDestructive = colors === "destructive";

    return (
        <Card
            onClick={onClick}
            className={cn(
                "border shadow-none cursor-default text-foreground overflow-hidden transition-all py-2 bg-gradient-to-t from-primary/2 to-card",
                variant === "action" && (isDestructive ? "bg-destructive/5 border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40" : "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/40"),
                isInteractive && "cursor-pointer active:scale-[0.98]",
                className
            )}
        >
            <CardContent className="p-3 sm:p-4 flex justify-between items-start">
                <div className="flex flex-col h-full flex-1 min-w-0">
                    <div className="space-y-0.5 sm:space-y-1">
                        <div className="flex justify-between items-start gap-1">
                            <h2 className={cn(
                                "text-lg sm:text-2xl font-bold tracking-tight truncate",
                                variant === "action" && (isDestructive ? "text-destructive" : "text-primary")
                            )}>
                                {title}
                            </h2>
                            {icon && (
                                <div className={cn(
                                    "p-1.5 sm:p-2 rounded-md shrink-0",
                                    variant === "action"
                                        ? (isDestructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    <Icon name={icon as any} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                            )}
                        </div>
                        <p className={cn(
                            "text-xs sm:text-base text-foreground line-clamp-1 font-semibold",
                            variant === "action" && (isDestructive ? "text-destructive" : "text-primary")
                        )}>
                            {subtitle}
                        </p>
                    </div>
                    {description && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground w-full font-medium mt-1 sm:mt-2 line-clamp-1">
                            {description}
                        </p>
                    )}
                </div>
            </CardContent>

        </Card>
    );
}
