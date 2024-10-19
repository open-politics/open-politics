import React, { useState } from 'react';
import { ArticleCard } from './ArticleCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DotLoader from 'react-spinners/DotLoader';
import { useBookMarkStore } from '@/hooks/useBookMarkStore'; // Import the bookmark store

interface ArticlesViewProps {
  locationName: string;
  articles: any[];
  isLoading: boolean;
  error: Error | null;
  fetchArticles: (searchQuery: string) => void;
  loadMore: () => void;
  resetArticles: () => void;
}

export function ArticlesView({ locationName, articles, isLoading, error, fetchArticles, loadMore, resetArticles }: ArticlesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { bookmarks, addBookmark, removeBookmark } = useBookMarkStore(); // Use the bookmark store

  const handleSearch = () => {
    resetArticles();
    fetchArticles(searchQuery);
  };

  const handleBookmarkAll = () => {
    articles.forEach(article => {
      addBookmark({
        id: article.url, // Assuming URL is unique
        headline: article.headline,
        paragraphs: article.paragraphs.slice(0, 350),
        url: article.url,
        source: article.source,
        insertion_date: new Date().toISOString(),
        entities: [], // Add logic to extract entities if needed
        tags: [], // Add logic to extract tags if needed
        classification: null, // Add logic to classify if needed
      });
    });
  };

  const handleUnbookmarkAll = () => {
    articles.forEach(article => {
      removeBookmark(article.url);
    });
  };

  const allBookmarked = articles.every(article => bookmarks.some(bookmark => bookmark.url === article.url));

  const filteredArticles = articles.filter(article =>
    article.headline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return <div className="text-red-500">{error.message}</div>;
  }

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex items-center space-x-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${locationName}'s articles`}
        />
        <Button onClick={handleSearch}>Search</Button>
        <Button onClick={allBookmarked ? handleUnbookmarkAll : handleBookmarkAll}>
          {allBookmarked ? 'Unbookmark All' : 'Bookmark All'}
        </Button> {/* Toggle button */}
      </div>
      {isLoading && articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          <DotLoader color="#000" size={50} />
          <p className="mt-4">Loading articles...</p>
        </div>
      ) : (
        <div className="overflow-y-auto flex-grow">
          <div className="space-y-2">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <ArticleCard
                  key={article.url}
                  {...article}
                />
              ))
            ) : (
              <p>No articles found.</p>
            )}
          </div>
          {!isLoading && articles.length >= 20 && (
            <Button onClick={loadMore} className="w-full mt-4">Load More</Button>
          )}
          {isLoading && articles.length > 0 && (
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