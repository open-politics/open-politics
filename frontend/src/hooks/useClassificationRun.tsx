import { useCallback } from 'react';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
import { useClassificationSystem } from './useClassificationSystem';

interface UseClassificationRunOptions {
  autoLoadRuns?: boolean;
}

/**
 * @deprecated Use useClassificationSystem instead
 * This is a compatibility layer for the old useClassificationRun hook.
 * It will be removed in a future version.
 */
export function useClassificationRun(options: UseClassificationRunOptions = {}) {
  console.warn(
    'useClassificationRun is deprecated and will be removed in a future version. ' +
    'Please use useClassificationSystem instead.'
  );
  
  const { activeWorkspace } = useWorkspaceStore();
  
  // Use our new consolidated hook internally
  const {
    runs,
    activeRun,
    results,
    schemes,
    documents,
    isLoadingRuns,
    isLoadingResults,
    isCreatingRun,
    error,
    loadRuns,
    loadRun,
    loadResultsByRun,
    createRun,
    setActiveRun
  } = useClassificationSystem({
    autoLoadRuns: options.autoLoadRuns
  });
  
  // Create a wrapper for loadResultsByRun that accepts both parameters
  const wrappedLoadResultsByRun = useCallback((runId: number, workspaceId?: number) => {
    return loadResultsByRun(runId, workspaceId);
  }, [loadResultsByRun]);
  
  // Return the same interface as the old hook
  return {
    runs,
    activeRun,
    results,
    schemes,
    documents,
    isLoadingRuns,
    isLoadingResults,
    isCreatingRun,
    error,
    loadRuns,
    loadRun,
    loadResultsByRun: wrappedLoadResultsByRun,
    createRun,
    setActiveRun
  };
} 