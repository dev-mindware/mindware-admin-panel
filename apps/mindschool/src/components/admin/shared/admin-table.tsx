"use client";

import type { icons } from "lucide-react";
import { Button, GenericTable, Icon, ListSkeleton, type Column } from "@workspace/ui";
import type { useCursorList } from "@workspace/hooks";

type CursorList<T extends { id: string | number }> = ReturnType<typeof useCursorList<T>>;

interface AdminTableProps<T extends { id: string | number }> {
  list: CursorList<T>;
  columns: Column<T>[];
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon?: keyof typeof icons;
  /** Linha para telemóvel (cartão); sem ela a tabela desloca-se na horizontal. */
  mobileCard?: (item: T) => React.ReactNode;
}

/**
 * Tabela padrão das listas do painel: a carregar, erro com «tentar de novo», vazio, paginação numerada sobre o cursor da API e «carregar mais».
 * Todas as listas usam este componente: mesmo comportamento e mesmos estados em todo o painel.
 */
export function AdminTable<T extends { id: string | number }>({ list, columns, emptyTitle, emptyDescription, emptyIcon = "PackageSearch", mobileCard }: AdminTableProps<T>) {
  if (list.isLoading) return <ListSkeleton cols={Math.min(columns.length, 6)} rows={5} />;

  if (list.isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-card py-12 text-center">
        <Icon name="CircleAlert" className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Não foi possível carregar a lista.</p>
        <Button size="sm" variant="outline" onClick={() => void list.refetch()} className="gap-2">
          <Icon name="RefreshCcw" className="size-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {mobileCard && (
        <div className="space-y-3 sm:hidden">
          {list.rows.length === 0 ? (
            <div className="rounded-2xl border bg-card px-4 py-8 text-center text-xs text-muted-foreground">{emptyDescription}</div>
          ) : (
            list.rows.map((item) => <div key={item.id}>{mobileCard(item)}</div>)
          )}
        </div>
      )}
      <div className={mobileCard ? "hidden sm:block" : undefined}>
        <GenericTable<T>
          data={list.rows}
          columns={columns}
          page={list.page}
          total={list.loaded}
          totalPages={list.totalPages}
          setPage={list.setPage}
          goToNextPage={list.goToNextPage}
          goToPreviousPage={list.goToPreviousPage}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          emptyIcon={emptyIcon}
        />
      </div>
      {list.isFetchingMore && <p className="text-center text-xs text-muted-foreground">A carregar mais…</p>}
    </div>
  );
}
