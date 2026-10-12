import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface Option {
  value: string | number;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value?: string | number;
  placeholder?: string;
  options: Option[];
  hint?: string;
  disabled?: boolean;
  onValueChange: (value: string) => void;
  className?: string;
}

export function SelectField({
  label,
  value,
  placeholder = "Selecione",
  options,
  hint,
  disabled,
  onValueChange,
  className,
}: SelectFieldProps) {
  return (
    <div className={`flex flex-col ${className ?? ""}`}>
      <label className="text-sm font-medium mb-1">{label}</label>
      <Select value={String(value)} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
