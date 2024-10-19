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

export type ArticleCardProps = {
  id: string;
  headline: string;
  paragraphs: string;
  url: string;
  source: string;
  insertion_date: string | null;
  entities: Array<{
    id: string;
    name: string;
    entity_type: string;
    locations: Array<{
      name: string;
      type: string;
      coordinates: number[] | null;
    }>;
  }>;
  tags: Array<{
    id: string;
    name: string;
  }>;
  classification: {
    article_id: string;
    title: string;
    news_category: string;
    secondary_categories: string[];
    keywords: string[];
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
};

export function ArticleCard({ id, headline, paragraphs, url, source, insertion_date, entities = [], tags = [], classification, className, ...props }: ArticleCardProps & React.ComponentProps<typeof Card>) {
  const { bookmarks, addBookmark, removeBookmark } = useBookMarkStore(); // Use the bookmark store

  const isBookmarked = bookmarks.some(bookmark => bookmark.url === url);

  const handleBookmark = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent the click from triggering the Dialog
    if (isBookmarked) {
      removeBookmark(url);
    } else {
      addBookmark({
        id,
        headline,
        paragraphs,
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
    event.stopPropagation(); // Prevent the click from affecting the EntityCard selection
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className={cn("rounded-lg overflow-y-auto cursor-pointer relative", className)} {...props} onClick={handleCardClick}>
          <div className="p-4">
            <div className="absolute top-2 right-2" onClick={handleBookmark}>
              {isBookmarked ? <BookMarked className="text-blue-500" /> : <Bookmark className="text-gray-500" />}
            </div>
            <h4 className="mb-2 text-lg font-semibold">{headline}</h4>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{paragraphs}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {classification && (
                <>
                  <Badge variant="secondary">{classification.news_category}</Badge>
                  {classification.secondary_categories.map((category) => (
                    <Badge key={category} variant="outline">{category}</Badge>
                  ))}
                </>
              )}
            </div>
            {classification && (
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                <div>
                  <p>🏛️ Classification: {classification.news_category}</p>
                  <p>🔍 Event Type: {classification.event_type}</p>
                  <p>📊 General Interest: <span className={`font-bold ${getColorClass(classification.general_interest_score, false)}`}>{classification.general_interest_score.toFixed(2)}</span></p>
                </div>
                <div>
                  <p>🚫 Spam Score: <span className={`font-bold ${getColorClass(classification.spam_score, true)}`}>{classification.spam_score.toFixed(2)}</span></p>
                  <p>🎣 Clickbait Score: <span className={`font-bold ${getColorClass(classification.clickbait_score, true)}`}>{classification.clickbait_score.toFixed(2)}</span></p>
                  <p>🛑 Fake News Score: <span className={`font-bold ${getColorClass(classification.fake_news_score, true)}`}>{classification.fake_news_score.toFixed(2)}</span></p>
                  <p>😂 Satire Score: <span className={`font-bold ${getColorClass(classification.satire_score, true)}`}>{classification.satire_score.toFixed(2)}</span></p>
                </div>
                <div>
                  <p>🌍 Geopolitical Relevance: <span className={`font-bold ${getColorClass(classification.geopolitical_relevance, false)}`}>{classification.geopolitical_relevance.toFixed(2)}</span></p>
                  <p>📜 Legislative Influence: <span className={`font-bold ${getColorClass(classification.legislative_influence_score, false)}`}>{classification.legislative_influence_score.toFixed(2)}</span></p>
                  <p>🌐 International Relevance: <span className={`font-bold ${getColorClass(classification.international_relevance_score, false)}`}>{classification.international_relevance_score.toFixed(2)}</span></p>
                  <p>🗳️ Democratic Process Implications: <span className={`font-bold ${getColorClass(classification.democratic_process_implications_score, false)}`}>{classification.democratic_process_implications_score.toFixed(2)}</span></p>
                </div>
              </div>
            )}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{source}</span>
              {insertion_date && <span>{new Date(insertion_date).toLocaleDateString()}</span>}
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-[100vw] md:max-w-[50vw] flex flex-col">
        <DialogHeader>
          <DialogTitle>{headline}</DialogTitle>
          <DialogDescription>{source} - {insertion_date && new Date(insertion_date).toLocaleDateString()}</DialogDescription>
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
              <p>🏛️ Classification: {classification.news_category}</p>
              <p>🌍 Geopolitical Relevance: <span className={`font-bold ${getColorClass(classification.geopolitical_relevance, false)}`}>{classification.geopolitical_relevance.toFixed(2)}</span></p>
              <p>📜 Legislative Influence: <span className={`font-bold ${getColorClass(classification.legislative_influence_score, false)}`}>{classification.legislative_influence_score.toFixed(2)}</span></p>
              <p>🌐 International Relevance: <span className={`font-bold ${getColorClass(classification.international_relevance_score, false)}`}>{classification.international_relevance_score.toFixed(2)}</span></p>
              <p>🗳️ Democratic Process Implications: <span className={`font-bold ${getColorClass(classification.democratic_process_implications_score, false)}`}>{classification.democratic_process_implications_score.toFixed(2)}</span></p>
              <p>📊 General Interest: <span className={`font-bold ${getColorClass(classification.general_interest_score, false)}`}>{classification.general_interest_score.toFixed(2)}</span></p>
              <p>🚫 Spam Score: <span className={`font-bold ${getColorClass(classification.spam_score, true)}`}>{classification.spam_score.toFixed(2)}</span></p>
              <p>🎣 Clickbait Score: <span className={`font-bold ${getColorClass(classification.clickbait_score, true)}`}>{classification.clickbait_score.toFixed(2)}</span></p>
              <p>🛑 Fake News Score: <span className={`font-bold ${getColorClass(classification.fake_news_score, true)}`}>{classification.fake_news_score.toFixed(2)}</span></p>
              <p>😂 Satire Score: <span className={`font-bold ${getColorClass(classification.satire_score, true)}`}>{classification.satire_score.toFixed(2)}</span></p>
              <p>🔍 Event Type: {classification.event_type}</p>
            </div>
          )}
          <p className="text-sm mb-4">{paragraphs}</p>
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

export default ArticleCard;
