import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ArticleCardProps = {
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
    news_category: string;
    secondary_categories: string[];
    keywords: string[];
    geopolitical_relevance: number;
    legislative_influence_score: number;
    international_relevance_score: number;
    democratic_process_implications_score: number
    general_interest_score: number
    spam_score: number
    clickbait_score: number
    fake_news_score: number
    satire_score: number
  } | null;
};

export function ArticleCard({ id, headline, paragraphs, url, source, insertion_date, entities = [], tags = [], classification, className, ...props }: ArticleCardProps & React.ComponentProps<typeof Card>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className={cn("rounded-lg overflow-y-auto cursor-pointer", className)} {...props}>
          <div className="p-4">
            <h4 className="mb-2 text-lg font-semibold">{headline}</h4>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{paragraphs}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {entities.slice(0, 3).map((entity) => (
                <Badge key={entity.id} variant="secondary">{entity.name}</Badge>
              ))}
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="outline">{tag.name}</Badge>
              ))}
            </div>
            {classification && (
              <div className="text-xs text-muted-foreground mb-2">
                <p>🏛️ Classification: {classification.news_category}</p>
                <p>🌍 Geopolitical Relevance: <span className={`font-bold ${getColorClass(classification.geopolitical_relevance)}`}>{classification.geopolitical_relevance.toFixed(2)}</span></p>
                <p>📜 Legislative Influence: <span className={`font-bold ${getColorClass(classification.legislative_influence_score)}`}>{classification.legislative_influence_score.toFixed(2)}</span></p>
                <p>🌐 International Relevance: <span className={`font-bold ${getColorClass(classification.international_relevance_score)}`}>{classification.international_relevance_score.toFixed(2)}</span></p>
                <p>🗳️ Democratic Process Implications: <span className={`font-bold ${getColorClass(classification.democratic_process_implications_score)}`}>{classification.democratic_process_implications_score.toFixed(2)}</span></p>
                <p>📊 General Interest: <span className={`font-bold ${getColorClass(classification.general_interest_score)}`}>{classification.general_interest_score.toFixed(2)}</span></p>
                <p>🚫 Spam Score: <span className={`font-bold ${getColorClass(classification.spam_score, true)}`}>{classification.spam_score.toFixed(2)}</span></p>
                <p>🎣 Clickbait Score: <span className={`font-bold ${getColorClass(classification.clickbait_score, true)}`}>{classification.clickbait_score.toFixed(2)}</span></p>
                <p>🛑 Fake News Score: <span className={`font-bold ${getColorClass(classification.fake_news_score, true)}`}>{classification.fake_news_score.toFixed(2)}</span></p>
                <p>😂 Satire Score: <span className={`font-bold ${getColorClass(classification.satire_score, true)}`}>{classification.satire_score.toFixed(2)}</span></p>
              </div>
            )}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{source}</span>
              {insertion_date && <span>{new Date(insertion_date).toLocaleDateString()}</span>}
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{headline}</DialogTitle>
          <DialogDescription>{source} - {insertion_date && new Date(insertion_date).toLocaleDateString()}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 overflow-y-auto flex-grow">
          <div className="flex flex-wrap gap-2 mb-4 max-h-[20vh] overflow-y-auto">
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
              <p>🌍 Geopolitical Relevance: <span className={`font-bold ${getColorClass(classification.geopolitical_relevance)}`}>{classification.geopolitical_relevance.toFixed(2)}</span></p>
              <p>📜 Legislative Influence: <span className={`font-bold ${getColorClass(classification.legislative_influence_score)}`}>{classification.legislative_influence_score.toFixed(2)}</span></p>
              <p>🌐 International Relevance: <span className={`font-bold ${getColorClass(classification.international_relevance_score)}`}>{classification.international_relevance_score.toFixed(2)}</span></p>
              <p>🗳️ Democratic Process Implications: <span className={`font-bold ${getColorClass(classification.democratic_process_implications_score)}`}>{classification.democratic_process_implications_score.toFixed(2)}</span></p>
              <p>📊 General Interest: <span className={`font-bold ${getColorClass(classification.general_interest_score)}`}>{classification.general_interest_score.toFixed(2)}</span></p>
              <p>🚫 Spam Score: <span className={`font-bold ${getColorClass(classification.spam_score, true)}`}>{classification.spam_score.toFixed(2)}</span></p>
              <p>🎣 Clickbait Score: <span className={`font-bold ${getColorClass(classification.clickbait_score, true)}`}>{classification.clickbait_score.toFixed(2)}</span></p>
              <p>🛑 Fake News Score: <span className={`font-bold ${getColorClass(classification.fake_news_score, true)}`}>{classification.fake_news_score.toFixed(2)}</span></p>
              <p>😂 Satire Score: <span className={`font-bold ${getColorClass(classification.satire_score, true)}`}>{classification.satire_score.toFixed(2)}</span></p>
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
  const threshold = isNegative ? 1 - value / 10 : value / 10;
  if (threshold < 0.33) return 'text-green-500';
  if (threshold < 0.66) return 'text-yellow-500';
  return 'text-red-500';
}

export default ArticleCard;