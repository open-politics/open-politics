import { useState, useEffect, useCallback, useRef } from 'react';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
import { useApiKeysStore } from '@/zustand_stores/storeApiKeys';
import { useToast } from '@/components/ui/use-toast';
import { 
  ClassifiableContent, 
  ClassificationResult, 
  ClassificationScheme,
  FormattedClassificationResult
} from '@/lib/classification/types';
import { useClassificationSystem } from './useClassificationSystem';

interface UseClassificationOptions {
  loadSchemesOnMount?: boolean;
  loadResultsOnMount?: boolean;
  contentId?: number;
  runId?: number;
  useCache?: boolean;
  preloadedSchemes?: ClassificationScheme[];
}

/**
 * @deprecated Use useClassificationSystem instead
 * This is a compatibility layer for the old useClassification hook.
 * It will be removed in a future version.
 */
export function useClassification(options: UseClassificationOptions = {}) {
  console.warn(
    'useClassification is deprecated and will be removed in a future version. ' +
    'Please use useClassificationSystem instead.'
  );
  
  // If preloaded schemes are provided, use them directly
  const [schemes, setSchemes] = useState<ClassificationScheme[]>(options.preloadedSchemes || []);
  
  // Use our new consolidated hook internally
  const hookResult = useClassificationSystem({
    autoLoadSchemes: options.preloadedSchemes ? false : options.loadSchemesOnMount,
    contentId: options.contentId,
    runId: options.runId,
    useCache: options.useCache !== false
  });
  
  // If preloaded schemes are provided, use them instead of loading from API
  useEffect(() => {
    if (options.preloadedSchemes && options.preloadedSchemes.length > 0) {
      setSchemes(options.preloadedSchemes);
    } else {
      setSchemes(hookResult.schemes);
    }
  }, [options.preloadedSchemes, hookResult.schemes]);
  
  // Track if initial data has been loaded
  const initialSchemesLoaded = useRef(false);
  const initialResultsLoaded = useRef(false);
  
  // Track the last content ID and run ID that were loaded
  const lastContentId = useRef<number | undefined>(undefined);
  const lastRunId = useRef<number | undefined>(undefined);
  
  // Load results on mount if requested
  useEffect(() => {
    if (options.loadResultsOnMount && 
        options.contentId && 
        !initialResultsLoaded.current) {
      hookResult.loadResults(options.contentId, options.runId);
      initialResultsLoaded.current = true;
    }
  }, [hookResult.loadResults, options.loadResultsOnMount, options.contentId, options.runId]);
  
  // Return the same interface as the old hook, but with our local schemes state
  return {
    schemes,
    results: hookResult.results,
    isLoadingSchemes: options.preloadedSchemes ? false : hookResult.isLoadingSchemes,
    isLoadingResults: hookResult.isLoadingResults,
    isClassifying: hookResult.isClassifying,
    error: hookResult.error,
    loadSchemes: hookResult.loadSchemes,
    loadResults: hookResult.loadResults,
    classifyContent: hookResult.classifyContent,
    batchClassify: hookResult.batchClassify,
    clearResultsCache: hookResult.clearResultsCache,
    createScheme: hookResult.createScheme,
    updateScheme: hookResult.updateScheme,
    deleteScheme: hookResult.deleteScheme
  };
}