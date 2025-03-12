import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteRun {
  id: number;
  name: string;
  timestamp: string;
  documentCount: number;
  schemeCount: number;
  workspaceId: string | number;
  description?: string;
}

interface FavoriteRunsState {
  favoriteRuns: FavoriteRun[];
  addFavoriteRun: (run: FavoriteRun) => void;
  removeFavoriteRun: (runId: number) => void;
  isFavorite: (runId: number) => boolean;
  getFavoriteRunsByWorkspace: (workspaceId: string | number) => FavoriteRun[];
}

export const useFavoriteRunsStore = create<FavoriteRunsState>()(
  persist(
    (set, get) => ({
      favoriteRuns: [],
      
      addFavoriteRun: (run: FavoriteRun) => {
        set((state) => {
          // Check if run already exists
          const exists = state.favoriteRuns.some(r => r.id === run.id);
          if (exists) return state;
          
          return {
            favoriteRuns: [...state.favoriteRuns, run]
          };
        });
      },
      
      removeFavoriteRun: (runId: number) => {
        set((state) => ({
          favoriteRuns: state.favoriteRuns.filter(run => run.id !== runId)
        }));
      },
      
      isFavorite: (runId: number) => {
        return get().favoriteRuns.some(run => run.id === runId);
      },
      
      getFavoriteRunsByWorkspace: (workspaceId: string | number) => {
        // Convert both to strings for comparison to handle both string and number types
        const workspaceIdStr = String(workspaceId);
        return get().favoriteRuns.filter(run => String(run.workspaceId) === workspaceIdStr);
      }
    }),
    {
      name: 'favorite-runs-storage',
    }
  )
); 