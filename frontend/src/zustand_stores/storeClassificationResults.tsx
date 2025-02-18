import { create } from 'zustand';
import {
  ClassificationResultsService,
} from '@/client/services';
import { ClassificationResultRead, ClassificationResultCreate } from '@/client/models';

interface ClassificationResultState {
  classificationResults: ClassificationResultRead[];
  workingResult: ClassificationResultRead | null;
  autoSave: boolean;
  error: string | null;
  selectedRun: string | null;
  fetchClassificationResults: (documentId: number, workspaceId: number, runName?: string | null) => Promise<void>;
  createClassificationResult: (result: ClassificationResultCreate, workspaceId: number) => Promise<ClassificationResultRead>;
  setWorkingResult: (result: ClassificationResultRead | null) => void;
  setAutoSave: (enabled: boolean) => void;
  setSelectedRun: (runName: string | null) => void;
  fetchResultsByScheme: (schemeId: number, workspaceId: number) => Promise<void>;
}

export const useClassificationResultStore = create<ClassificationResultState>((set, get) => ({
  classificationResults: [],
  workingResult: null,
  autoSave: true,
  error: null,
  selectedRun: null,

  fetchClassificationResults: async (documentId: number, workspaceId: number, runName?: string | null) => {
    if (!workspaceId) return;
    try {
      const response = await ClassificationResultsService.listClassificationResults({
        workspaceId: workspaceId,
        documentIds: [documentId],
        skip: 0,
        limit: 100,
        runName: runName,
      });
      set({ classificationResults: response, error: null });
    } catch (error: any) {
      set({ error: "Error fetching classification results", classificationResults: [] });
      console.error(error);
    }
  },

  createClassificationResult: async (result: ClassificationResultCreate, workspaceId: number) => {
    if (!workspaceId) throw new Error("No workspace ID provided");
    
    const response = await ClassificationResultsService.createClassificationResult({
      workspaceId: workspaceId,
      requestBody: {
        ...result,
        value: result.value
      },
    });
    
    // Update the results list if autoSave is enabled
    if (get().autoSave) {
      await get().fetchClassificationResults(result.document_id, workspaceId, result.run_name);
    }
    
    return response;
  },

  setWorkingResult: (result: ClassificationResultRead | null) => set({ workingResult: result }),
  setAutoSave: (enabled: boolean) => set({ autoSave: enabled }),
  setSelectedRun: (runName: string | null) => set({ selectedRun: runName }),

  fetchResultsByScheme: async (schemeId: number, workspaceId: number) => {
    if (!workspaceId) return;
    try {
      const response = await ClassificationResultsService.listClassificationResults({
        workspaceId: workspaceId,
        schemeIds: [schemeId],
        skip: 0,
        limit: 100,
      });
      set({ classificationResults: response, error: null });
    } catch (error: any) {
      set({ error: "Error fetching classification results", classificationResults: [] });
      console.error(error);
    }
  },
}));