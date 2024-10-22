// open-politics/frontend/src/components/SelectedArticlesView.tsx

import React, { useContext } from 'react';
import { ArticleSelectionContext } from '@/contexts/ArticleSelectionContext';
import { Button } from '@/components/ui/button';
import { ArticleCard } from '@/components/ContentCard';

export const SelectedArticlesView: React.FC = () => {
  const { selectedArticles, clearSelections } = useContext(ArticleSelectionContext);

  return (
    <div className="selected-articles-view">
      <h2>Selected Articles</h2>
      {selectedArticles.length === 0 ? (
        <p>No articles selected.</p>
      ) : (
        <>
          <div className="article-list">
            {selectedArticles.map(article => (
              <ArticleCard key={article.id} {...article} />
            ))}
          </div>
          <Button onClick={clearSelections}>Clear Selection</Button>
        </>
      )}
    </div>
  );
};