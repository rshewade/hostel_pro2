'use client';

import { useState, useMemo } from 'react';
import { cn } from '../utils';
import { Button } from '../ui/Button';
import type { TableProps, TableColumn, TableRowDensity } from '../types';

// Row density padding classes
const DENSITY_CLASSES: Record<TableRowDensity, { header: string; cell: string }> = {
  compact: { header: 'px-3 py-2', cell: 'px-3 py-1.5' },
  normal: { header: 'px-4 py-3', cell: 'px-4 py-3' },
  comfortable: { header: 'px-5 py-4', cell: 'px-5 py-4' },
};

const Table = <T,>({
  className,
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  density = 'normal',
  pagination,
  striped = false,
  stickyHeader = false,
  ...props
}: TableProps<T>) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = (a as any)[sortColumn];
      const bVal = (b as any)[sortColumn];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const handleSort = (columnKey: string | number | symbol) => {
    const key = String(columnKey);
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const tableClasses = cn(
    // Base table styles
    'w-full border-collapse bg-white',
    'border border-gray-200 rounded-lg overflow-hidden',

    // Custom classes
    className
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={tableClasses} {...props}>
        <thead className={cn('bg-gray-50', stickyHeader && 'sticky top-0 z-10')}>
          <tr>
            {columns.map((column, columnIndex) => (
              <th
                key={columnIndex}
                className={cn(
                  DENSITY_CLASSES[density].header,
                  'text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  'border-b border-gray-200',
                  column.width && `w-${column.width}`,
                  column.sortable && 'cursor-pointer hover:bg-gray-100 select-none'
                )}
                style={column.width ? { width: column.width } : undefined}
                onClick={column.sortable ? () => handleSort(column.key) : undefined}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {column.sortable && (
                    <div className="flex flex-col">
                      <svg
                        className={cn(
                          'w-3 h-3',
                          sortColumn === column.key && sortDirection === 'asc'
                            ? 'text-gray-900'
                            : 'text-gray-400'
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      <svg
                        className={cn(
                          'w-3 h-3 -mt-1',
                          sortColumn === column.key && sortDirection === 'desc'
                            ? 'text-gray-900'
                            : 'text-gray-400'
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedData.map((row, index) => (
            <tr
              key={index}
              className={cn(
                'hover:bg-gray-50',
                onRowClick && 'cursor-pointer',
                striped && index % 2 === 1 && 'bg-gray-50'
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column, columnIndex) => (
                <td
                  key={columnIndex}
                  className={cn(DENSITY_CLASSES[density].cell, 'text-sm text-gray-900')}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.render
                    ? column.render((row as any)[column.key], row)
                    : String((row as any)[column.key] || '')
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>
              Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </span>
            {pagination.onPageSizeChange && pagination.pageSizeOptions && (
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
                className="ml-2 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                {pagination.pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              Previous
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => pagination.onPageChange(pageNum)}
                    className={cn(
                      'px-3 py-1 text-sm rounded',
                      pageNum === pagination.currentPage
                        ? 'bg-gold-500 text-navy-950 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

Table.displayName = 'Table';

export { Table };