import { useState, useEffect, useCallback } from 'react';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
import { useToast } from '@/components/ui/use-toast';
import { ClassifiableDocument } from '@/lib/classification/types';
import { useClassificationSystem } from './useClassificationSystem';

interface UseDocumentsOptions {
  autoLoad?: boolean;
  limit?: number;
}

/**
 * @deprecated Use useClassificationSystem instead
 * This is a compatibility layer for the old useDocuments hook.
 * It will be removed in a future version.
 */
export function useDocuments(options: UseDocumentsOptions = {}) {
  console.warn(
    'useDocuments is deprecated and will be removed in a future version. ' +
    'Please use useClassificationSystem instead.'
  );
  
  // Use our new consolidated hook internally
  const {
    documents,
    selectedDocument,
    isLoadingDocuments: isLoading,
    error,
    loadDocuments,
    loadDocument,
    createDocument,
    setSelectedDocument
  } = useClassificationSystem({
    autoLoadDocuments: options.autoLoad
  });
  
  // State for operations not yet implemented in the consolidated hook
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Load documents on mount if requested
  useEffect(() => {
    if (options.autoLoad) {
      loadDocuments();
    }
  }, [options.autoLoad, loadDocuments]);
  
  // These methods are not yet implemented in the consolidated hook
  // They will be added in a future version
  const updateDocument = useCallback(async (documentId: number, documentData: Partial<ClassifiableDocument>) => {
    console.warn('updateDocument is not yet implemented in the consolidated hook');
    return null;
  }, []);
  
  const deleteDocument = useCallback(async (documentId: number) => {
    console.warn('deleteDocument is not yet implemented in the consolidated hook');
    return false;
  }, []);
  
  // Return the same interface as the old hook
  return {
    documents,
    selectedDocument,
    isLoading,
    isCreating,
    isUpdating,
    error,
    loadDocuments,
    loadDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    setSelectedDocument
  };
} 