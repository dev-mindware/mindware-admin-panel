"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";

interface FilterBarProps {
    label?: string;
    value: string;
    onValueChange: (value: string) => void;
    options: { label: string; value: string }[];
    placeholder?: string;
}

export function FilterBar({ 
    label, 
    value, 
    onValueChange, 
    options, 
    placeholder = "Todos" 
}: FilterBarProps) {
    return (
        <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-lg border">
            {label && <Label className="text-sm font-medium whitespace-nowrap">{label}:</Label>}
            <Select value={value || "all"} onValueChange={(val) => onValueChange(val === "all" ? "" : val)}>
                <SelectTrigger className="w-[200px] bg-background">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{placeholder}</SelectItem>
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
