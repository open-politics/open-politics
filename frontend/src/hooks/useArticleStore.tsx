import create from 'zustand';
import { ArticleCardProps } from '@/components/ArticleCard';

interface ArticleStore {
  selectedArticles: ArticleCardProps[];
  toggleArticleSelection: (article: ArticleCardProps) => void;
  clearSelections: () => void;
}

export const useArticleStore = create<ArticleStore>((set) => ({
  selectedArticles: [],
  toggleArticleSelection: (article) => set((state) => {
    const isSelected = state.selectedArticles.some(a => a.id === article.id);
    return {
      selectedArticles: isSelected
        ? state.selectedArticles.filter(a => a.id !== article.id)
        : [...state.selectedArticles, article],
    };
  }),
  clearSelections: () => set({ selectedArticles: [] }),
}));