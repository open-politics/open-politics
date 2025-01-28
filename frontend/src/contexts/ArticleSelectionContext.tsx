// open-politics/frontend/src/contexts/ArticleSelectionContext.tsx
'use client'

import React, { createContext, useState } from 'react';
import { ContentCardProps } from '@/components/collection/ContentCard';

interface ArticleSelectionContextType {
  selectedArticles: ContentCardProps[];
  toggleArticleSelection: (article: ContentCardProps) => void;
  clearSelections: () => void;
}

export const ArticleSelectionContext = createContext<ArticleSelectionContextType>({
  selectedArticles: [],
  toggleArticleSelection: () => {},
  clearSelections: () => {},
});

export const ArticleSelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedArticles, setSelectedArticles] = useState<ContentCardProps[]>([]);

  const toggleArticleSelection = (article: ContentCardProps) => {
    setSelectedArticles(prev => {
      if (prev.some(a => a.id === article.id)) {
        return prev.filter(a => a.id !== article.id);
      } else {
        return [...prev, article];
      }
    });
  };

  const clearSelections = () => {
    setSelectedArticles([]);
  };

  return (
    <ArticleSelectionContext.Provider value={{ selectedArticles, toggleArticleSelection, clearSelections }}>
      {children}
    </ArticleSelectionContext.Provider>
  );
};