import { useState } from 'react';
import { useClassificationSystem } from './useClassificationSystem';

/**
 * @deprecated Use useClassificationSystem instead
 * This is a compatibility layer for the old useClassificationSchemes hook.
 * It will be removed in a future version.
 * 
 * IMPORTANT: Please migrate to useClassificationSystem for all new code.
 */
const useClassificationSchemes = () => {
  console.warn(
    'useClassificationSchemes is deprecated and will be removed in a future version. ' +
    'Please use useClassificationSystem instead.'
  );
  
  const { 
    classifyContent, 
    loadResults, 
    schemes,
    isLoadingSchemes
  } = useClassificationSystem({ autoLoadSchemes: true });
  
  // Provide a compatible interface
  return {
    classificationSchemesQuery: { 
      data: schemes,
      isLoading: isLoadingSchemes
    },
    runClassification: ({ schemeId, documentId }: { schemeId: number, documentId: number }) => {
      return classifyContent({ id: documentId }, schemeId);
    }
  };
};

export default useClassificationSchemes; 