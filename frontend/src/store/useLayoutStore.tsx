import { create } from 'zustand'

interface LayoutState {
  isTwoColumn: boolean;
  activeTab: string;
  toggleColumnLayout: () => void;
  setActiveTab: (tab: string) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isTwoColumn: false,
  activeTab: 'articles', // Set default active tab
  toggleColumnLayout: () => set((state) => ({ isTwoColumn: !state.isTwoColumn })),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));