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
    locations: Array<{
      id: string;
      name: string;
      location_type: string;
      coordinates: number[] | null;
      weight: number;
    }>;
  }>;
  tags: Array<{
    id: string;
    name: string;
  }>;
  evaluation: {
    content_id: string;
    rhetoric: string;
    sociocultural_interest: number | null;
    global_political_impact: number | null;
    regional_political_impact: number | null;
    global_economic_impact: number | null;
    regional_economic_impact: number | null;
    event_type: string | null;
    event_subtype: string | null;
    keywords: string[] | null;
    categories: string[] | null;
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
  evaluation, 
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
        evaluation
      });
    }
  };

  const handleCardClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className={cn("rounded-md opacity-90 bg-background-blur  overflow-y-auto cursor-pointer relative max-h-[500px]", className)} {...props} onClick={handleCardClick}>
          <div className="p-3">  {/* Reduced padding */}
            <div className="absolute top-2 right-2" onClick={handleBookmark}>
              {isBookmarked ? <BookMarked className="text-blue-500" /> : <Bookmark className="text-gray-500" />}
            </div>
            <span className="text-xs text-muted-foreground mb-2">
              {source && <span>Source: <span className="text-green-500">{source}</span></span>}
              {author && ` • ${author}`}
              {insertion_date && ` • ${new Date(insertion_date).toLocaleDateString()}`}
            </span>
            <h4 className="mb-2 text-lg font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2 leading-relaxed tracking-wide">
              {text_content}
            </p>
            <div className="flex flex-wrap gap-1 mb-2">
              {evaluation && (
                <>
                  <Badge variant="secondary">{evaluation.rhetoric}</Badge>
                  {evaluation.keywords?.map((keyword) => (
                    <Badge key={keyword} variant="outline">{keyword}</Badge>
                  ))}
                </>
              )}
            </div>
            {evaluation && (
              <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground mb-2"> {/* Reduced gap */}
                <div className="grid grid-cols-2 gap-1"> {/* Reduced gap */}
                  <div className="p-1 border border-transparent hover:border-blue-500 transition-colors"> {/* Reduced padding */}
                    <p className="text-sm font-semibold">🔍 {evaluation.event_type}</p>
                  </div>
                  <div className="p-1 border border-transparent hover:border-blue-500 transition-colors">
                    <p className="text-sm font-semibold">🏛️ {evaluation.rhetoric}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-1">
                  {/* Political Impact Metrics */}
                  <div className="p-1 border border-transparent hover:border-blue-500 transition-colors">
                    <p className="font-semibold mb-1">Political Impact</p> {/* Reduced margin */}
                    <div className="grid grid-cols-3 gap-1"> {/* Changed to 3 columns */}
                      <div className="p-0.5"> {/* Minimal padding */}
                        <p className="text-xs text-gray-500">Geo</p>
                        <p className="text-xs">🌍 <span className={`font-bold ${getColorClass(evaluation.global_political_impact, false)}`}>
                          {evaluation.global_political_impact.toFixed(1)}
                        </span></p>
                      </div>
                      <div className="p-0.5">
                        <p className="text-xs text-gray-500">Legislative</p>
                        <p className="text-xs">📜 <span className={`font-bold ${getColorClass(evaluation.regional_political_impact, false)}`}>
                          {evaluation.regional_political_impact.toFixed(1)}
                        </span></p>
                      </div>
                      <div className="p-0.5">
                        <p className="text-xs text-gray-500">International</p>
                        <p className="text-xs">🌐 <span className={`font-bold ${getColorClass(evaluation.global_economic_impact, false)}`}>
                          {evaluation.global_economic_impact.toFixed(1)}
                        </span></p>
                      </div>
                      <div className="p-0.5">
                        <p className="text-xs text-gray-500">Democratic</p>
                        <p className="text-xs">🗳️ <span className={`font-bold ${getColorClass(evaluation.regional_economic_impact, false)}`}>
                          {evaluation.regional_economic_impact.toFixed(1)}
                          </span></p>
                      </div>
                      <div className="p-0.5">
                        <p className="text-xs text-gray-500">Interest</p>
                        <p className="text-xs">📊 <span className={`font-bold ${getColorClass(evaluation.sociocultural_interest, false)}`}>
                          {evaluation.sociocultural_interest.toFixed(1)}
                        </span></p>
                      </div>
                    </div>
                  </div>

                  {/* Content Quality Metrics */}
                  <div className="p-1 border border-transparent hover:border-blue-500 transition-colors">
                    <p className="font-semibold mb-1">Content Quality</p>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="p-0.5">
                        <p className="text-xs text-gray-500">Spam</p>
                        <p className="text-xs">🚫 <span className={`font-bold ${getColorClass(evaluation.global_political_impact, true)}`}>
                          {evaluation.global_political_impact.toFixed(1)}
                        </span></p>
                      </div>
                      <div className="p-0.5">
                        <p className="text-xs text-gray-500">Clickbait</p>
                        <p className="text-xs">🎣 <span className={`font-bold ${getColorClass(evaluation.global_economic_impact, true)}`}>
                          {evaluation.global_economic_impact.toFixed(1)}
                        </span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
          <p className="text-sm mb-4 leading-relaxed tracking-wide whitespace-pre-line">
            {text_content?.slice(0, 450)}
            {text_content && text_content.length > 450 && '...'}
          </p>
          <div className="flex flex-wrap flex-row gap-2 mb-4 max-h-[10vh] overflow-y-auto">
            Tags:
            {tags.map((tag) => (
              <Badge key={tag.id} variant="outline">{tag.name}</Badge>
            ))}
            Entities:
            {entities.map((entity) => (
              <Badge key={entity.id} variant="secondary">{entity.name}</Badge>
            ))}
          </div>
          {evaluation && (
              <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground mb-2"> {/* Reduced gap */}
                <div className="grid grid-cols-2 gap-1"> {/* Reduced gap */}
                  <div className="p-1 border border-transparent hover:border-blue-500 transition-colors"> {/* Reduced padding */}
                    <p className="text-sm font-semibold">🔍 {evaluation.event_type}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-1">
                  {/* Political Impact Metrics */}
                  <div className="p-1 border border-transparent hover:border-blue-500 transition-colors">
                    <p className="font-semibold mb-1">Political Impact</p> {/* Reduced margin */}
                    <div className="grid grid-cols-3 gap-1"> {/* Changed to 3 columns */}
                      <div className="p-0.5"> {/* Minimal padding */}
                        <p className="text-xs text-gray-500">Geo</p>
                        <p className="text-xs">🌍 <span className={`font-bold ${getColorClass(evaluation.global_political_impact, false)}`}>
                          {evaluation.global_political_impact?.toFixed(1)}
                        </span></p>
                      </div>
                      <div className="p-0.5">
                        <p className="text-xs text-gray-500">Legislative</p>
                        <p className="text-xs">📜 <span className={`font-bold ${getColorClass(evaluation.regional_political_impact, false)}`}>
                          {evaluation.regional_political_impact?.toFixed(1)}
                        </span></p>
                      </div>
                      <div className="p-0.5">
                        <p className="text-xs text-gray-500">International</p>
                        <p className="text-xs">🌐 <span className={`font-bold ${getColorClass(evaluation.global_economic_impact, false)}`}>
                          {evaluation.global_economic_impact?.toFixed(1)}
                        </span></p>
                      </div>
                      <div className="p-0.5">
                        <p className="text-xs text-gray-500">Democratic</p>
                        <p className="text-xs">🗳️ <span className={`font-bold ${getColorClass(evaluation.regional_economic_impact, false)}`}>
                          {evaluation.regional_economic_impact?.toFixed(1)}
                          </span></p>
                      </div>
                      <div className="p-0.5">
                        <p className="text-xs text-gray-500">Interest</p>
                        <p className="text-xs">📊 <span className={`font-bold ${getColorClass(evaluation.sociocultural_interest, false)}`}>
                          {evaluation.sociocultural_interest?.toFixed(1)}
                        </span></p>
                      </div>
                    </div>
                  </div>

                  {/* Content Quality Metrics */}
                  <div className="p-1 border border-transparent hover:border-blue-500 transition-colors">
                    <p className="font-semibold mb-1">Content Quality</p>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="p-0.5">
                        <p className="text-xs text-gray-500">Spam</p>
                        <p className="text-xs">🚫 <span className={`font-bold ${getColorClass(evaluation.global_political_impact, true)}`}>
                          {evaluation.global_political_impact?.toFixed(1)}
                        </span></p>
                      </div>
                      <div className="p-0.5">
                        <p className="text-xs text-gray-500">Clickbait</p>
                        <p className="text-xs">🎣 <span className={`font-bold ${getColorClass(evaluation.global_economic_impact, true)}`}>
                          {evaluation.global_economic_impact?.toFixed(1)}
                        </span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )} 
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
