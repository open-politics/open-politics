'use client'
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bookmark, BookMarked } from 'lucide-react'; // Import bookmark icons
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBookMarkStore } from '@/hooks/useBookMarkStore';

export interface ContentCardProps {
  id: string;
  title: string | null;
  text_content: string | null;
  url: string;
  source: string | null;
  insertion_date: string;
  content_type?: string;
  content_language?: string | null;
  author?: string | null;
  publication_date?: string | null;
  entities: Array<{
    id: string;
    name: string;
    entity_type: string;
    locations?: Array<{
      id: string;
      name: string;
      location_type: string | null;
      coordinates: number[] | null;
      weight: number;
    }>;
  }>;
  tags: Array<{
    id: string;
    name: string;
  }>;
  classification: {
    content_id: string;
    category: string;
    secondary_categories: string[] | null;
    keywords: string[] | null;
    geopolitical_relevance: number;
    legislative_influence_score: number;
    international_relevance_score: number;
    democratic_process_implications_score: number;
    general_interest_score: number;
    spam_score: number;
    clickbait_score: number;
    fake_news_score: number;
    satire_score: number;
    event_type: string;
  } | null;
  className?: string;
}

export function ContentCard({ 
  id, 
  title, 
  text_content, 
  url, 
  source, 
  insertion_date,
  content_type,
  content_language,
  author,
  publication_date, 
  entities = [], 
  tags = [], 
  classification, 
  className, 
  ...props 
}: ContentCardProps) {
  const { bookmarks, addBookmark, removeBookmark } = useBookMarkStore();

  const isBookmarked = bookmarks.some(bookmark => bookmark.url === url);

  const handleBookmark = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isBookmarked) {
      removeBookmark(url);
    } else {
      addBookmark({
        id,
        title,
        text_content,
        url,
        source,
        insertion_date,
        entities,
        tags,
        classification
      });
    }
  };

  const handleCardClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className={cn("rounded-lg overflow-y-auto cursor-pointer relative", className)} {...props} onClick={handleCardClick}>
          <div className="p-4">
            <div className="absolute top-2 right-2" onClick={handleBookmark}>
              {isBookmarked ? <BookMarked className="text-blue-500" /> : <Bookmark className="text-gray-500" />}
            </div>
            <span className="text-xs text-muted-foreground mb-2">
              {source && `Source: ${source}`}
              {author && ` • ${author}`}
            </span>
            <h4 className="mb-2 text-lg font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2 leading-relaxed tracking-wide">
              {text_content}
            </p>
            <div className="flex flex-wrap gap-1 mb-2">
              {classification && (
                <>
                  <Badge variant="secondary">{classification.category}</Badge>
                  {classification.secondary_categories?.map((category) => (
                    <Badge key={category} variant="outline">{category}</Badge>
                  ))}
                </>
              )}
            </div>
            {classification && (
              <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground mb-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 border hover:border-blue-500 transition-colors">
                    <p className="text-sm font-semibold">🔍 Event Type: {classification.event_type}</p>
                  </div>
                  <div className="p-3 border hover:border-blue-500 transition-colors">
                    <p className="text-sm font-semibold">🏛️ Classification: {classification.category}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {/* Political Impact Metrics */}
                  <div className="p-2 border hover:border-blue-500 transition-colors">
                    <p className="font-semibold mb-2">Political Impact</p>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="p-1">
                        <p className="text-xs text-gray-500">Geopolitical</p>
                        <p className="text-sm">🌍 <span className={`font-bold ${getColorClass(classification.geopolitical_relevance, false)}`}>
                          {classification.geopolitical_relevance.toFixed(2)}
                        </span></p>
                      </div>
                      <div className="p-1">
                        <p className="text-xs text-gray-500">Legislative</p>
                        <p className="text-sm">📜 <span className={`font-bold ${getColorClass(classification.legislative_influence_score, false)}`}>
                          {classification.legislative_influence_score.toFixed(2)}
                        </span></p>
                      </div>
                      <div className="p-1">
                        <p className="text-xs text-gray-500">International</p>
                        <p className="text-sm">🌐 <span className={`font-bold ${getColorClass(classification.international_relevance_score, false)}`}>
                          {classification.international_relevance_score.toFixed(2)}
                        </span></p>
                      </div>
                      <div className="p-1">
                        <p className="text-xs text-gray-500">Democratic</p>
                        <p className="text-sm">🗳️ <span className={`font-bold ${getColorClass(classification.democratic_process_implications_score, false)}`}>
                          {classification.democratic_process_implications_score.toFixed(2)}
                          </span></p>
                      </div>
                      <div className="p-1">
                        <p className="text-xs text-gray-500">Interest</p>
                        <p className="text-sm">📊 <span className={`font-bold ${getColorClass(classification.general_interest_score, false)}`}>
                          {classification.general_interest_score.toFixed(2)}
                        </span></p>
                      </div>
                    </div>
                  </div>

                  {/* Content Quality Metrics */}
                  <div className="p-2 border hover:border-blue-500 transition-colors">
                    <p className="font-semibold mb-2">Content Quality</p>
                    <div className="grid grid-cols-2 gap-1">
                      
                      <div className="p-1">
                        <p className="text-xs text-gray-500">Spam</p>
                        <p className="text-sm">🚫 <span className={`font-bold ${getColorClass(classification.spam_score, true)}`}>
                          {classification.spam_score.toFixed(2)}
                        </span></p>
                      </div>
                      <div className="p-1">
                        <p className="text-xs text-gray-500">Clickbait</p>
                        <p className="text-sm">🎣 <span className={`font-bold ${getColorClass(classification.clickbait_score, true)}`}>
                          {classification.clickbait_score.toFixed(2)}
                        </span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-between text-xs text-muted-foreground">
              {insertion_date && <span>{new Date(insertion_date).toLocaleDateString()}</span>}
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-[100vw] md:max-w-[50vw] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {source} 
            {author && ` • ${author}`}
            {insertion_date && ` • ${new Date(insertion_date).toLocaleDateString()}`}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 overflow-y-auto flex-grow">
          <div className="flex flex-wrap flex-row gap-2 mb-4 max-h-[20vh] overflow-y-auto">
            {entities.map((entity) => (
              <Badge key={entity.id} variant="secondary">{entity.name}</Badge>
            ))}
            {tags.map((tag) => (
              <Badge key={tag.id} variant="outline">{tag.name}</Badge>
            ))}
          </div>
          {classification && (
            <div className="text-sm mb-4">
              <div className="grid grid-cols-1 gap-4 text-xs text-muted-foreground mb-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border hover:border-blue-500 transition-colors">
                    <p className="text-sm font-semibold">🔍 Event Type: {classification.event_type}</p>
                  </div>
                  <div className="p-3 border hover:border-blue-500 transition-colors">
                    <p className="text-sm font-semibold">🏛️ Classification: {classification.category}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Political Impact Metrics */}
                  <div className="p-3 border hover:border-blue-500 transition-colors">
                    <p className="font-semibold mb-3">Political Impact</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2">
                        <p className="text-xs text-gray-500">Geopolitical</p>
                        <p className="text-lg">🌍 <span className={`font-bold ${getColorClass(classification.geopolitical_relevance, false)}`}>
                          {classification.geopolitical_relevance.toFixed(2)}
                        </span></p>
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-gray-500">Legislative</p>
                        <p className="text-lg">📜 <span className={`font-bold ${getColorClass(classification.legislative_influence_score, false)}`}>
                          {classification.legislative_influence_score.toFixed(2)}
                        </span></p>
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-gray-500">International</p>
                        <p className="text-lg">🌐 <span className={`font-bold ${getColorClass(classification.international_relevance_score, false)}`}>
                          {classification.international_relevance_score.toFixed(2)}
                        </span></p>
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-gray-500">Democratic</p>
                        <p className="text-lg">🗳️ <span className={`font-bold ${getColorClass(classification.democratic_process_implications_score, false)}`}>
                          {classification.democratic_process_implications_score.toFixed(2)}
                          </span></p>
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-gray-500">Interest</p>
                        <p className="text-lg">📊 <span className={`font-bold ${getColorClass(classification.general_interest_score, false)}`}>
                          {classification.general_interest_score.toFixed(2)}
                        </span></p>
                      </div>
                    </div>
                  </div>

                  {/* Content Quality Metrics */}
                  <div className="p-3 border hover:border-blue-500 transition-colors">
                    <p className="font-semibold mb-3">Content Quality</p>
                    <div className="grid grid-cols-2 gap-2">
                      
                      <div className="p-2">
                        <p className="text-xs text-gray-500">Spam</p>
                        <p className="text-lg">🚫 <span className={`font-bold ${getColorClass(classification.spam_score, true)}`}>
                          {classification.spam_score.toFixed(2)}
                        </span></p>
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-gray-500">Clickbait</p>
                        <p className="text-lg">🎣 <span className={`font-bold ${getColorClass(classification.clickbait_score, true)}`}>
                          {classification.clickbait_score.toFixed(2)}
                        </span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <p className="text-sm mb-4 leading-relaxed tracking-wide whitespace-pre-line">
            {text_content?.slice(0, 450)}
            {text_content && text_content.length > 450 && '...'}
          </p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
            Read full article
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getColorClass(value: number, isNegative: boolean = false): string {
  if (isNegative) {
    if (value < 3.33) return 'text-green-500';
    if (value < 6.66) return 'text-yellow-500';
    return 'text-red-500';
  } else {
    if (value < 3.33) return 'text-red-500';
    if (value < 6.66) return 'text-yellow-500';
    return 'text-red-500';
  }
}

export default ContentCard;
