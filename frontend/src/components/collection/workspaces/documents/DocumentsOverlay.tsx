'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DocumentsPage from '@/components/collection/workspaces/tables/documents/page';
import { Button } from '@/components/ui/button';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
import EditDocumentOverlay from './EditDocumentOverlay';
import { DocumentRead } from '@/client/models';

interface DocumentsOverlayProps {
  open: boolean;
  onClose: () => void;
  onDocumentSelect: (documentId: number) => void;
}

interface DocumentsPageProps {
  onEdit: (document: DocumentRead) => void;
  workspaceId: number;
  onDocumentSelect: (documentId: number) => void;
}

export default function DocumentsOverlay({ open, onClose, onDocumentSelect }: DocumentsOverlayProps) {
  const { activeWorkspace } = useWorkspaceStore();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);

  useEffect(() => {
    console.log('DocumentsOverlay open state:', open);
  }, [open]);

  if (!activeWorkspace) {
    return null;
  }

  const handleEdit = (document: DocumentRead) => {
    setSelectedDocumentId(document.id);
    setIsEditOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="z-[200] max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-secondary-500">
              Documents in {activeWorkspace.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <DocumentsPage
              onDocumentSelect={onDocumentSelect}
            />
          </div>
        </DialogContent>
      </Dialog>

      <EditDocumentOverlay
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        documentId={selectedDocumentId ?? 0}
        defaultTitle={""}
        defaultTopImage={""}
        defaultContentType={""}
        defaultInsertionDate={new Date().toISOString()}
      />
    </>
  );
}