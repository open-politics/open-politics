import { create } from 'zustand'

interface ArticleTabNameState {
  tabName: string;
  setTabName: (name: string) => void;
}

export const useArticleTabNameStore = create<ArticleTabNameState>((set) => ({
  tabName: 'Articles', 
  setTabName: (name) => set(() => ({ tabName: name })),
}));  