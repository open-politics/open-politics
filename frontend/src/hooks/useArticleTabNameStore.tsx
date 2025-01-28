import { create } from 'zustand'

interface ArticleTabNameState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useArticleTabNameStore = create<ArticleTabNameState>((set) => ({
  activeTab: 'articles', // Set default tab
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
