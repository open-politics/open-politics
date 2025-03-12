'use client';

import React, { useState } from 'react';
import { useDocumentStore } from '@/zustand_stores/storeDocuments';
import { DataTable } from '@/components/collection/workspaces/tables/data-table';
import { columns } from './columns';
import { DocumentRead } from '@/client/models';
import { DocumentTransferPopover } from '../../documents/DocumentTransferPopover';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DocumentsTableProps {
  onDocumentSelect: (documentId: number) => void;
}

export default function DocumentsTable({ onDocumentSelect }: DocumentsTableProps) {
  const { documents, deleteDocument } = useDocumentStore();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return;
    
    setIsDeleting(true);
    try {
      // Delete each selected document one by one
      for (const documentId of selectedRows) {
        await deleteDocument(documentId);
      }
      setSelectedRows([]);
    } catch (error) {
      console.error('Error deleting documents:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDeleteAll = async () => {
    if (documents.length === 0) return;
    
    setIsDeleting(true);
    try {
      // Delete all documents one by one
      for (const document of documents) {
        await deleteDocument(document.id);
      }
    } catch (error) {
      console.error('Error deleting all documents:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteAllDialogOpen(false);
    }
  };

  return (
    <div className="h-full p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Documents</h2>
        <div className="flex items-center gap-2">
          {selectedRows.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedRows.length})
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsDeleteAllDialogOpen(true)}
            disabled={documents.length === 0 || isDeleting}
            className="flex items-center gap-1 text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Delete All
          </Button>
          <DocumentTransferPopover
            selectedDocumentIds={selectedRows}
            onComplete={() => setSelectedRows([])}
          />
        </div>
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

      {/* Delete Selected Documents Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Selected Documents
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRows.length} selected document{selectedRows.length !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteSelected();
              }}
              disabled={isDeleting}
              className="bg-highlighted"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Documents Dialog */}
      <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete All Documents
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all {documents.length} document{documents.length !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAll();
              }}
              disabled={isDeleting}
              className="bg-highlighted"
            >
              {isDeleting ? 'Deleting...' : 'Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 