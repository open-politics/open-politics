'use client';

import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  Row,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onEdit?: (item: TData) => void;
  onView?: (item: TData) => void;
  onDelete?: (item: TData) => void;
  onCreate?: () => void;
  onRowClick?: (row: TData) => void;
  renderRow?: (row: Row<TData>) => React.ReactNode;
  enableRowSelection?: boolean;
  onRowSelectionChange?: (selectedRows: number[]) => void;
  selectedRows?: number[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onEdit,
  onView,
  onDelete,
  onCreate,
  onRowClick,
  renderRow,
  enableRowSelection,
  onRowSelectionChange,
  selectedRows = [],
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleRowSelect = (rowId: number) => {
    if (!onRowSelectionChange) return;
    
    const newSelection = selectedRows.includes(rowId)
      ? selectedRows.filter(id => id !== rowId)
      : [...selectedRows, rowId];
    
    onRowSelectionChange(newSelection);
  };

  return (
    <div>
      <div className="rounded-md border-bg max-h-[3000px] md:max-h-[700px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {enableRowSelection && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.length === data.length}
                    onCheckedChange={(checked) => {
                      if (onRowSelectionChange) {
                        onRowSelectionChange(
                          checked 
                            ? data.map((row: any) => row.id)
                            : []
                        );
                      }
                    }}
                  />
                </TableHead>
              )}
              {table.getHeaderGroups().map((headerGroup) => (
                headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                renderRow ? (
                  <React.Fragment key={row.id}>
                    {renderRow(row)}
                  </React.Fragment>
                ) : (
                  <TableRow 
                    key={row.id} 
                    onClick={() => onRowClick?.(row.original)}
                    className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  >
                    {enableRowSelection && (
                      <TableCell className="w-12">
                        <Checkbox
                          checked={selectedRows.includes((row.original as any).id)}
                          onCheckedChange={() => handleRowSelect((row.original as any).id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}