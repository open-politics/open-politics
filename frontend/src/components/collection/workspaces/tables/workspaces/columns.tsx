'use client';

import { ColumnDef } from '@tanstack/react-table';

export type Workspace = {
  uid: number;
  name: string;
  description?: string;
  sources?: string[];
  icon?: string;
  created_at: string;
  updated_at: string;
};

export const columns: ColumnDef<Workspace>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'sources',
    header: 'Sources',
    cell: ({ row }) => row.original.sources?.join(', ') || '',
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleString(),
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated At',
    cell: ({ row }) =>
      new Date(row.original.updated_at).toLocaleString(),
  },
  // Add action columns if needed
];
