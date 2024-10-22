import React, { useState } from 'react';
import { ContentCard } from './ContentCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DotLoader from 'react-spinners/DotLoader';
import { useBookMarkStore } from '@/hooks/useBookMarkStore';

interface ArticlesViewProps {
  locationName: string;
  contents: any[];
  isLoading: boolean;
  error: Error | null;
  fetchContents: (searchQuery: string) => void;
  loadMore: () => void;
  resetContents: () => void;
}

export function ArticlesView({ locationName, contents = [], isLoading, error, fetchContents, loadMore, resetContents }: ArticlesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { bookmarks, addBookmark, removeBookmark } = useBookMarkStore();

  const handleSearch = () => {
    resetContents();
    fetchContents(searchQuery);
  };

  const handleBookmarkAll = () => {
    contents.forEach(content => {
      addBookmark({
        id: content.url,
        title: content.title,
        content_type: content.content_type,
        source: content.source,
        insertion_date: content.insertion_date,
        text_content: content.text_content.slice(0, 350),
        entities: content.entities,
        tags: content.tags,
        classification: content.classification,
        url: content.url,
        content_language: content.content_language || null,
        author: content.author || null,
        publication_date: content.publication_date || null,
        version: content.version || 1,
        is_active: content.is_active || true,
        embeddings: content.embeddings || null,
        media_details: content.media_details || null,
      });
    });
  };

  const handleUnbookmarkAll = () => {
    contents.forEach(content => {
      removeBookmark(content.url);
    });
  };

  const allBookmarked = contents.every(content => bookmarks.some(bookmark => bookmark.url === content.url));

  const filteredContents = contents.filter(content =>
    content.title?.toLowerCase().includes(searchQuery.toLowerCase())
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
      {isLoading && contents.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          <DotLoader color="#000" size={50} />
          <p className="mt-4">Loading articles...</p>
        </div>
      ) : (
        <div className="overflow-y-auto flex-grow">
          <div className="space-y-2">
            {filteredContents.length > 0 ? (
              filteredContents.map((content) => (
                <ContentCard
                  key={content.url}
                  {...content}
                />
              ))
            ) : (
              <p>No articles found.</p>
            )}
          </div>
          {!isLoading && contents.length >= 20 && (
            <Button onClick={loadMore} className="w-full mt-4">Load More</Button>
          )}
          {isLoading && contents.length > 0 && (
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
