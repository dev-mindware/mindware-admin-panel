"use client";

import { GenericTable, type Column } from "@workspace/ui";

interface Props<T extends { id: string | number }> {
  data: T[];
  columns: Column<T>[];
  emptyTitle: string;
  emptyDescription?: string;
}

/** Tabela de uma só página para as listas dos relatórios (já vêm limitadas pela API). */
export function ReportTable<T extends { id: string | number }>({
  data,
  columns,
  emptyTitle,
  emptyDescription,
}: Props<T>) {
  return (
    <GenericTable<T>
      data={data}
      columns={columns}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyIcon="ClipboardList"
      page={1}
      total={data.length}
      totalPages={1}
      setPage={() => {}}
      goToNextPage={() => {}}
      goToPreviousPage={() => {}}
    />
  );
}
