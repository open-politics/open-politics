import { create } from 'zustand'

interface LayoutState {
  isTwoColumn: boolean;
  activeTab: string;
  isVisible: boolean;
  toggleColumnLayout: () => void;
  setActiveTab: (tab: string) => void;
  toggleVisibility: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isTwoColumn: false,
  activeTab: 'articles',
  isVisible: false,
  toggleColumnLayout: () => set((state) => ({ isTwoColumn: !state.isTwoColumn })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
}));