import React, { useState, useEffect, useCallback } from 'react';
import { ArticleCard } from './ArticleCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DotLoader from 'react-spinners/DotLoader';

interface ArticlesViewProps {
  locationName: string;
  articles: any[];
  isLoading: boolean;
  error: Error | null;
  fetchArticles: (searchQuery: string, skip: number) => void;
  resetArticles: () => void;
}

export function ArticlesView({ locationName, articles, isLoading, error, fetchArticles, resetArticles }: ArticlesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [skip, setSkip] = useState(0);

  useEffect(() => {
    resetArticles();
    fetchArticles('', 0);
    setSkip(20);
  }, [locationName, resetArticles, fetchArticles]);

  const handleSearch = () => {
    resetArticles();
    fetchArticles(searchQuery, 0);
    setSkip(20);
  };

  const loadMore = () => {
    fetchArticles(searchQuery, skip);
    setSkip(prev => prev + 20);
  };

  if (error) {
    return <div className="text-red-500">{error.message}</div>;
  }

 return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex space-x-2">
         <Input
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          <DotLoader color="#000" size={50} />
          <p className="mt-4">Loading articles...</p>
        </div>
      ) : (
        <div className="overflow-y-auto flex-grow">
          <div className="space-y-2">
            {articles.map((article) => (
              <ArticleCard
                key={article.url}
                {...article}
              />
            ))}
          </div>
          {!isLoading && articles.length >= 20 && (
            <Button onClick={loadMore} className="w-full mt-4">Load More</Button>
          )}
          {isLoading &&articles.length > 0 && (
            <div className="flex justify-center mt-4">
              <DotLoader color="#000" size={30} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ArticlesView;