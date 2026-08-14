import { Separator } from "../../ui";

interface TitleListProps {
  title?: string;
  suTitle?: string;
  separator?: boolean;
  children?: React.ReactNode;
}

export function TitleList({
  title,
  suTitle,
  separator,
  children,
}: TitleListProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full mb-6">
      <div className="space-y-0.5 min-w-0 flex-1">
        {title && (
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground text-start">
            {title}
          </h2>
        )}
        {suTitle && (
          <p className="text-xs sm:text-sm text-muted-foreground text-start">
            {suTitle}
          </p>
        )}
      </div>
      {separator && <Separator />}
      {children && (
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}

