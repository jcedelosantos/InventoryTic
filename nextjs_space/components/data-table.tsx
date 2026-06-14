'use client';
import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actions?: (row: any) => React.ReactNode;
  pageSize?: number;
}

export default function DataTable({ columns, data, searchPlaceholder, onSearch, actions, pageSize = 10 }: DataTableProps) {
  const [page, setPage] = useState(0);
  const [localSearch, setLocalSearch] = useState('');

  const safeData = data ?? [];
  const filtered = onSearch ? safeData : safeData.filter((row: any) => {
    if (!localSearch) return true;
    return (columns ?? []).some((col: any) => {
      const val = row?.[col?.key];
      return val != null && String(val).toLowerCase().includes(localSearch.toLowerCase());
    });
  });

  const totalPages = Math.max(1, Math.ceil((filtered?.length ?? 0) / pageSize));
  const paginated = filtered?.slice(page * pageSize, (page + 1) * pageSize) ?? [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder || 'Buscar...'}
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              setPage(0);
              onSearch?.(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {(columns ?? []).map((col: any) => (
                <th key={col?.key} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{col?.label}</th>
              ))}
              {actions && <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {(paginated?.length ?? 0) === 0 ? (
              <tr><td colSpan={(columns?.length ?? 0) + (actions ? 1 : 0)} className="text-center py-12 text-gray-400 text-sm">No hay registros</td></tr>
            ) : (
              paginated.map((row: any, idx: number) => (
                <tr key={row?.id ?? idx} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                  {(columns ?? []).map((col: any) => (
                    <td key={col?.key} className="px-4 py-3 text-sm text-gray-700">
                      {col?.render ? col.render(row?.[col?.key], row) : (row?.[col?.key] ?? '-')}
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(filtered?.length ?? 0) > pageSize && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Mostrando {page * pageSize + 1} - {Math.min((page + 1) * pageSize, filtered?.length ?? 0)} de {filtered?.length ?? 0}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-600 px-2">{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
