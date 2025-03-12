import { create } from 'zustand';
import { ClassificationResultsService } from '@/client/services';
import { format } from 'date-fns';

export interface RunHistoryItem {
  id: number;
  name: string;
  timestamp: string;
  documentCount: number;
  schemeCount: number;
  description?: string;
}

interface RunHistoryState {
  runs: RunHistoryItem[];
  isLoading: boolean;
  error: string | null;
  fetchRunHistory: (workspaceId: number) => Promise<void>;
}

export const useRunHistoryStore = create<RunHistoryState>((set) => ({
  runs: [],
  isLoading: false,
  error: null,

  fetchRunHistory: async (workspaceId: number) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch all classification results to extract unique run IDs
      const response = await ClassificationResultsService.listClassificationResults({
        workspaceId,
        skip: 0,
        limit: 1000, // Fetch a large number to get as many runs as possible
      });
      
      // Create a map to track unique runs and their document/scheme counts
      const runsMap = new Map<number, {
        id: number;
        name: string;
        timestamp: string;
        documentIds: Set<number>;
        schemeIds: Set<number>;
      }>();
      
      // Process each result to extract run information
      response.forEach(result => {
        if (result.run_id && result.run_name) {
          if (!runsMap.has(result.run_id)) {
            runsMap.set(result.run_id, {
              id: result.run_id,
              name: result.run_name,
              timestamp: result.timestamp ? format(new Date(result.timestamp), 'PPp') : format(new Date(), 'PPp'),
              documentIds: new Set([result.document_id]),
              schemeIds: new Set([result.scheme_id])
            });
          } else {
            const runInfo = runsMap.get(result.run_id)!;
            runInfo.documentIds.add(result.document_id);
            runInfo.schemeIds.add(result.scheme_id);
          }
        }
      });
      
      // Convert map to array of RunHistoryItems
      const runs = Array.from(runsMap.values()).map(runInfo => ({
        id: runInfo.id,
        name: runInfo.name,
        timestamp: runInfo.timestamp,
        documentCount: runInfo.documentIds.size,
        schemeCount: runInfo.schemeIds.size
      }));
      
      // Sort by timestamp (newest first)
      runs.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      set({ runs, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching run history:', error);
      set({ 
        error: error.message || 'Failed to fetch run history', 
        isLoading: false 
      });
    }
  },
})); 