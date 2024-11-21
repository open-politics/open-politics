'use client'
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bookmark, BookMarked, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
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
  top_image?: string | null;
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
  top_image,
  entities = [], 
  tags = [], 
  evaluation, 
  className, 
  ...props 
}: ContentCardProps) {
  const { bookmarks, addBookmark, removeBookmark } = useBookMarkStore();
  const [isTextExpanded, setIsTextExpanded] = useState(false);

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
        content_type,
        content_language,
        author,
        publication_date,
        top_image,
        entities,
        tags,
        evaluation
      });
    }
  };

  const handleCardClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const displayDate = publication_date 
    ? new Date(publication_date).toLocaleDateString() 
    : new Date(insertion_date).toLocaleDateString();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card 
          className={cn("rounded-md opacity-90 bg-background-blur overflow-y-auto cursor-pointer relative max-h-[500px]", className)} 
          {...props} 
          onClick={(e) => e.stopPropagation()}
        >
          {top_image && (
            <div className="absolute top-0 right-0 w-1/4 h-full bg-cover bg-center z-10" style={{ backgroundImage: `url(${top_image})` }}></div>
          )}
          <div className="p-3" style={{ maxWidth: '75%' }}>
            <div className="absolute top-2 right-2 z-20" onClick={handleBookmark}>
              {isBookmarked ? <BookMarked className="text-blue-500" /> : <Bookmark className="text-gray-500" />}
            </div>
            <span className="text-xs text-muted-foreground mb-2">
              {source && <span>Source: <span className="text-green-500">{source}</span></span>}
              {author && ` • ${author}`}
              {` • ${displayDate}`}
            </span>
            <h4 className="mb-2 text-lg font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2 leading-relaxed tracking-wide">
              {text_content}
            </p>
            {evaluation && <EvaluationSummary evaluation={evaluation} />}
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] bg-transparent max-w-[100vw] md:max-w-[50vw] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {source && <span>Source: <span className="text-green-500">{source}</span></span>}
            {author && ` • ${author}`}
            {` • ${displayDate}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 overflow-y-auto flex-grow flex flex-col">
          {top_image && (
            <img src={top_image} alt={title || 'Top Image'} className="w-full h-auto mb-4" />
          )}
          {evaluation && <EvaluationDetails evaluation={evaluation} />}
          
          <div className="mt-auto">
            <div 
              className={cn(
                "relative transition-all duration-300 ease-in-out",
                !isTextExpanded ? "max-h-[100px] overflow-hidden" : "max-h-[1000px]"
              )}
              style={{ 
                transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)' 
              }}
            >
              <p className="text-sm mb-4 leading-relaxed tracking-wide whitespace-pre-line">
                {text_content}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsTextExpanded(!isTextExpanded)}
            className="rounded-full h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isTextExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.open(url, '_blank')}
          >
            <span>Read full article</span>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EvaluationSummary({ evaluation }: { evaluation: ContentCardProps['evaluation'] }) {
  return (
    <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground mb-2">
      <div className="grid grid-cols-2 gap-1">
        <div className="p-1 border border-transparent hover:border-blue-500 transition-colors">
          <p className="text-sm text-green-500 font-semibold">{evaluation.event_type}</p>
        </div>
        <div className="p-1 border border-transparent hover:border-blue-500 transition-colors">
          <p className="text-sm font-semibold">🗣️ {evaluation.rhetoric}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-1">
        <div className="p-1 border border-transparent hover:border-blue-500 transition-colors"> 
          <p className="font-semibold mb-1">Impact</p>
          <div className="grid grid-cols-4 gap-1">
            <ImpactDetail label="Global Political" value={evaluation.global_political_impact} />
            <ImpactDetail label="Regional Political" value={evaluation.regional_political_impact} />
            <ImpactDetail label="Global Economic" value={evaluation.global_economic_impact} />
            <ImpactDetail label="Regional Economic" value={evaluation.regional_economic_impact} />
          </div>
        </div>
      </div>
    </div>
  );
}

function EvaluationDetails({ evaluation }: { evaluation: ContentCardProps['evaluation'] }) {
  return (
    <>
      <div className="flex flex-wrap gap-1 mb-2">
        <Badge variant="secondary">{evaluation.rhetoric}</Badge>
        {evaluation.keywords?.map((keyword) => (
          <Badge key={keyword} variant="outline">{keyword}</Badge>
        ))}
      </div>
      
      <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground mb-4">
        <div className="grid grid-cols-2 gap-1">
          <div className="p-1 border border-transparent hover:border-blue-500 transition-colors">
            <p className="text-sm font-semibold">🔍 {evaluation.event_type}</p>
          </div>
          <div className="p-1 border border-transparent hover:border-blue-500 transition-colors">
            <p className="text-sm font-semibold">🏛️ {evaluation.rhetoric}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-1">
          <div className="p-1 border border-transparent hover:border-blue-500 transition-colors">
            <p className="font-semibold mb-1">Impact Assessment</p>
            <div className="grid grid-cols-4 gap-1">
              <ImpactDetail label="Global Political" value={evaluation.global_political_impact} />
              <ImpactDetail label="Regional Political" value={evaluation.regional_political_impact} />
              <ImpactDetail label="Global Economic" value={evaluation.global_economic_impact} />
              <ImpactDetail label="Regional Economic" value={evaluation.regional_economic_impact} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ImpactDetail({ label, value }: { label: string, value: number | null }) {
  return (
    <div className="p-0.5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xs"><span className={`font-bold ${getColorClass(value, false)}`}>
        {value?.toFixed(1)}
      </span></p>
    </div>
  );
}

function getColorClass(value: number | null, isNegative: boolean = false): string {
  if (value === null || value === undefined) return 'text-gray-500';
  
  if (isNegative) {
    if (value < 3.33) return 'text-green-500';
    if (value < 6.66) return 'text-yellow-500';
    return 'text-red-500';
  } else {
    if (value < 3.33) return 'text-red-500';
    if (value < 6.66) return 'text-yellow-500';
    return 'text-green-500';
  }
}

export default ContentCard;