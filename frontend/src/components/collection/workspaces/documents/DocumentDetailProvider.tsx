'use client';

import React from 'react';
import { useDocumentStore } from '@/zustand_stores/storeDocuments';
import DocumentDetailOverlay from './DocumentDetailOverlay';

interface DocumentDetailProviderProps {
  children: React.ReactNode;
  onLoadIntoRunner?: (runId: number, runName: string) => void;
}

export default function DocumentDetailProvider({
  children,
  onLoadIntoRunner
}: DocumentDetailProviderProps) {
  const { isDetailOpen, selectedDocumentId, closeDocumentDetail } = useDocumentStore();

  const handleLoadIntoRunner = (runId: number, runName: string) => {
    if (onLoadIntoRunner) {
      onLoadIntoRunner(runId, runName);
      closeDocumentDetail(); // Close the document detail after loading into runner
    }
  };

  return (
    <>
      {children}
      <DocumentDetailOverlay
        open={isDetailOpen}
        onClose={closeDocumentDetail}
        documentId={selectedDocumentId}
        onLoadIntoRunner={handleLoadIntoRunner}
      />
    </>
  );
} 