import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ApiKeysState {
  apiKeys: Record<string, string>;
  selectedProvider: string | null;
  selectedModel: string | null;
  setApiKey: (provider: string, key: string) => void;
  setSelectedProvider: (provider: string) => void;
  setSelectedModel: (model: string) => void;
  clearAllKeys: () => void;
}

export const useApiKeysStore = create<ApiKeysState>()(
  persist(
    (set) => ({
      apiKeys: {},
      selectedProvider: null,
      selectedModel: null,
      
      setApiKey: (provider: string, key: string) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key }
        })),
      setSelectedProvider: (provider: string) => set({ selectedProvider: provider }),
      setSelectedModel: (model: string) => set({ selectedModel: model }),
      
      clearAllKeys: () => set({
        apiKeys: {},
        selectedProvider: null,
        selectedModel: null
      })
    }),
    {
      name: 'api-keys-storage',
    }
  )
);