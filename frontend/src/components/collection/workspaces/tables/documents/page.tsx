'use client';

import React, { useState } from 'react';
import { useDocumentStore } from '@/zustand_stores/storeDocuments';
import { DataTable } from '@/components/collection/workspaces/tables/data-table';
import { columns } from './columns';
import { DocumentRead } from '@/client/models';
import { DocumentTransferPopover } from '../../documents/DocumentTransferPopover';

interface DocumentsTableProps {
  onDocumentSelect: (documentId: number) => void;
}

export default function DocumentsTable({ onDocumentSelect }: DocumentsTableProps) {
  const { documents } = useDocumentStore();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  return (
    <div className="h-full p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Documents</h2>
        <DocumentTransferPopover
          selectedDocumentIds={selectedRows}
          onComplete={() => setSelectedRows([])}
        />
      </div>
      <DataTable
        columns={columns}
        data={documents as DocumentRead[]}
        onRowClick={(row) => {
          onDocumentSelect(row.id);
        }}
        enableRowSelection={true}
        onRowSelectionChange={(rows) => setSelectedRows(rows)}
        selectedRows={selectedRows}
      />
    </div>
  );
} 