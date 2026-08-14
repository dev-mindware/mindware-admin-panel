"use client";
import type React from "react";
import { cn } from "@workspace/utils";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../ui/pagination";

import { EmptyState } from "../empty-state";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: any;
  route?: string;
  page: number;
  total: number;
  totalPages: number;
  setPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export function GenericTable<T extends { id: string | number }>({
  data,
  columns,
  className,
  emptyTitle = "Nenhum dado encontrado",
  emptyDescription = "Não existem registros para exibir neste momento.",
  emptyIcon = "PackageSearch",
  page,
  total,
  totalPages,
  setPage,
  goToNextPage,
  goToPreviousPage,
  route,
}: DataTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newId = searchParams.get("newId");

  const getValue = (item: T, key: keyof T | string): any => {
    if (typeof key === "string" && key.includes(".")) {
      return key.split(".").reduce((obj: any, k) => obj?.[k], item);
    }
    return item[key as keyof T];
  };

  const handleRowDoubleClick = (item: T) => {
    if (route) router.push(`${route}/${item.id}`);
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* DESKTOP VIEW: Traditional HTML Table in Card Box (Hidden on Mobile) */}
      <div className="hidden md:block rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={cn(
                      "text-left text-sm font-semibold text-muted-foreground tracking-wider",
                      column.className
                    )}
                  >
                    {column.header || "—"}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="p-0"
                  >
                    <EmptyState 
                        title={emptyTitle}
                        description={emptyDescription}
                        icon={emptyIcon}
                        className="border-0 bg-transparent py-16"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className={cn(
                      "hover:bg-muted/50 transition-colors",
                      route && "cursor-pointer",
                      String(item.id) === newId && "animate-pulse-twice"
                    )}
                    onDoubleClick={() => handleRowDoubleClick(item)}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className={cn(
                          "text-sm text-foreground",
                          column.className
                        )}
                      >
                        {column.render
                          ? column.render(getValue(item, column.key), item)
                          : getValue(item, column.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MOBILE VIEW: Full-Width Apple/Mindgest Card Stack (Hidden on Desktop) */}
      <div className="block md:hidden w-full space-y-3">
        {data.length === 0 ? (
          <div className="rounded-2xl border border-border/80 bg-card text-center text-muted-foreground py-10 text-sm">
            <EmptyState 
                title={emptyTitle}
                description={emptyDescription}
                icon={emptyIcon}
                className="border-0 bg-transparent py-6"
            />
          </div>
        ) : (
          data.map((item, rowIndex) => {
            // Find header column (first column) and action column
            const headerCol = columns[0];
            const actionCol = columns.find(
              (c) =>
                String(c.header).toLowerCase().includes("acção") ||
                String(c.header).toLowerCase().includes("ação") ||
                String(c.header).toLowerCase().includes("action") ||
                String(c.header).toLowerCase().includes("ações") ||
                String(c.key).toLowerCase() === "action" ||
                String(c.key).toLowerCase() === "id"
            );

            // Secondary columns for card body (exclude action column)
            const bodyCols = columns.slice(1).filter((c) => c !== actionCol);

            return (
              <div
                key={rowIndex}
                onClick={() => handleRowDoubleClick(item)}
                className={cn(
                  "relative rounded-xl border border-border/80 bg-card p-4 shadow-xs transition-all active:scale-[0.98]",
                  route && "cursor-pointer",
                  String(item.id) === newId && "ring-2 ring-primary animate-pulse"
                )}
              >
                {/* Card Header: Main Title & Action Button/Badge */}
                <div className="flex items-start justify-between gap-2 pb-2">
                  <div className="font-bold text-sm text-foreground flex-1 line-clamp-1">
                    {headerCol?.render
                      ? headerCol.render(getValue(item, headerCol.key), item)
                      : getValue(item, headerCol?.key || "")}
                  </div>
                  {actionCol && (
                    <div className="shrink-0">
                      {actionCol.render
                        ? actionCol.render(getValue(item, actionCol.key), item)
                        : getValue(item, actionCol.key)}
                    </div>
                  )}
                </div>

                {/* Divider */}
                {bodyCols.length > 0 && (
                  <div className="my-2 border-t border-border/50" />
                )}

                {/* Card Body Sub-Grid: 2 Columns Key-Value Pairs */}
                {bodyCols.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    {bodyCols.map((col, cIdx) => {
                      const val = col.render
                        ? col.render(getValue(item, col.key), item)
                        : getValue(item, col.key);
                      if (val === undefined || val === null || val === "")
                        return null;

                      return (
                        <div key={cIdx} className="flex flex-col space-y-0.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                            {col.header}
                          </span>
                          <div className="text-xs font-medium text-foreground truncate">
                            {val}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>



      {/* PAGINATION FOOTER: Touch-Friendly Responsive Layout */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border border-border/80 bg-card shadow-xs text-xs sm:text-sm">
          <div className="text-muted-foreground text-center sm:text-left">
            Página <strong className="text-foreground">{page}</strong> de{" "}
            <strong className="text-foreground">{totalPages}</strong> — Total:{" "}
            <strong className="text-foreground">{total}</strong>
          </div>

          <Pagination className="w-max mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    goToPreviousPage();
                  }}
                  aria-disabled={page === 1}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 2), Math.min(totalPages, page + 1))
                .map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={page === pageNumber}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {totalPages > page + 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    goToNextPage();
                  }}
                  aria-disabled={page === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
