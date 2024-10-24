import { create } from 'zustand'

interface ArticleTabNameState {
  tabName: string;
  activeTab: string; // Add activeTab to the state
  setTabName: (name: string) => void;
  setActiveTab: (tab: string) => void; // Add setActiveTab action
}

export const useArticleTabNameStore = create<ArticleTabNameState>((set) => ({
  tabName: 'Articles',
  activeTab: 'articles', // Default tab
  setTabName: (name) => set(() => ({ tabName: name })),
  setActiveTab: (tab) => set(() => ({ activeTab: tab })),
}));
