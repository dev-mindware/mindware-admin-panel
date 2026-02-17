import { cn } from "@/lib/utils";
import { Icon } from "@/components";

export function IconCheckSucessfull({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center mb-4 w-20 h-20 rounded-full bg-green-100 text-green-600",
        className
      )}
    >
      <Icon name="CircleCheck" className="h-12 w-12" />
    </div>
  );
}
