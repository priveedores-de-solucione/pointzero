'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { useApi } from '@/hooks/use-api';
import { humanize } from '@/lib/mappers';
import type { PaginatedResponse } from '@/lib/api';

export interface AdminColumn<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

export interface AdminListQuery {
  page: number;
  limit: number;
  q?: string;
  filter?: string;
}

/**
 * Searchable, filterable, paginated admin table backed by a paginated API endpoint.
 * `actions` gets a `refetch` so row buttons can reload the list after a mutation.
 */
export function AdminList<T extends { id: string }>({
  fetcher,
  columns,
  filters,
  searchPlaceholder,
  actions,
  toolbar,
  reloadKey,
  emptyTitle = 'Nothing here yet',
  limit = 20,
}: {
  fetcher: (query: AdminListQuery) => Promise<PaginatedResponse<T>>;
  columns: AdminColumn<T>[];
  /** Backend enum values, e.g. ['SUBMITTED', 'ACCEPTED']. */
  filters?: string[];
  /** Omit to hide the search box (for endpoints without `q`). */
  searchPlaceholder?: string;
  actions?: (row: T, refetch: () => void) => React.ReactNode;
  toolbar?: React.ReactNode;
  /** Change to force a reload from outside (e.g. after a create dialog). */
  reloadKey?: unknown;
  emptyTitle?: string;
  limit?: number;
}) {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, loading, error, refetch } = useApi(
    () => fetcher({ page, limit, q: q || undefined, filter }),
    [page, q, filter, reloadKey],
  );
  const rows = data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {searchPlaceholder && (
            <Input placeholder={searchPlaceholder} className="max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
          )}
          {filters && (
            <div className="flex flex-wrap gap-2">
              {[undefined, ...filters].map((f) => (
                <Badge
                  key={f ?? 'all'}
                  variant={filter === f ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => {
                    setFilter(f);
                    setPage(1);
                  }}
                >
                  {f ? humanize(f) : 'All'}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {toolbar}
      </div>

      {loading && !data ? (
        <LoadingState />
      ) : error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : rows.length === 0 ? (
        <EmptyState title={emptyTitle} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => <TableHead key={c.header}>{c.header}</TableHead>)}
                {actions && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((c) => <TableCell key={c.header} className={c.className}>{c.cell(row)}</TableCell>)}
                  {actions && <TableCell className="text-right whitespace-nowrap">{actions(row, refetch)}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-end gap-3 text-sm text-muted-foreground">
          <span>Page {data.page} of {data.pages} · {data.total} total</span>
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Button size="sm" variant="outline" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

/** Runs an admin mutation with toast feedback, then reloads. Resolves to whether it succeeded. */
export async function runAction(fn: () => Promise<unknown>, success: string, refetch: () => void): Promise<boolean> {
  const { toast } = await import('sonner');
  try {
    await fn();
    toast.success(success);
    refetch();
    return true;
  } catch (err) {
    toast.error((err as Error).message || 'Action failed');
    return false;
  }
}

export const fmtDate = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—';
