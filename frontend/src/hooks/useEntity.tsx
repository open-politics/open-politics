import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

interface EntityData {
  contents: Content[];
  details: EntityDetails | null;
}

interface EntityDetails {
  name: string;
  type: string;
  article_count: number;
  total_frequency: number;
  relevance_score: number;
}

interface Content {
  id: string;
  url: string;
  title: string;
  source: string;
  insertion_date: string | null;
  text_content: string;
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
  evaluation: any | null;
}

export interface EntityMetrics {
  average_score: number;
  min_score: number;
  max_score: number;
}

export interface EntityContext {
  article_count: number;
  total_mentions: number;
}

export interface EntityReliability {
  confidence_score: number;
  avg_spam_score: number;
  avg_fake_news_score: number;
}

export interface EntityScore {
  date: string;
  metrics: EntityMetrics;
  context: EntityContext;
  reliability: EntityReliability;
}

export interface EntityScoreData {
  scores: EntityScore[];
  entity: string;
  scoreType: string;
}

export function useEntityData(entityName: string | null, isSelected: boolean) {
  const [data, setData] = useState<EntityData>({
    contents: [],
    details: null,
  });
  const [isLoading, setIsLoading] = useState({
    contents: false,
    details: false,
  });
  const [error, setError] = useState<{
    contents: Error | null;
    details: Error | null;
  }>({
    contents: null,
    details: null,
  });
  const [scoreData, setScoreData] = useState<EntityScoreData | null>(null);
  const [isLoadingScores, setIsLoadingScores] = useState(false);
  const [scoreError, setScoreError] = useState<Error | null>(null);

  const fetchIdRef = useRef(0);

  const fetchContents = useCallback(async (skip: number, limit: number, selectedDate?: string) => {
    if (!entityName || !isSelected) return; // Fetch only if an entity is selected
    setIsLoading((prev) => ({ ...prev, contents: true }));
    try {
      const url = selectedDate
        ? `/api/v1/locations/${encodeURIComponent(entityName)}/entities/contents?skip=${skip}&limit=${limit}&date=${encodeURIComponent(selectedDate)}`
        : `/api/v1/locations/${encodeURIComponent(entityName)}/entities/contents?skip=${skip}&limit=${limit}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch contents');
      }
      const fetchedData = await response.json();
      setData((prev) => ({
        ...prev,
        contents: skip === 0 ? fetchedData : [...prev.contents, ...fetchedData],
      }));
    } catch (error) {
      setError((prev) => ({ ...prev, contents: error as Error }));
    } finally {
      setIsLoading((prev) => ({ ...prev, contents: false })); 
    }
  }, [entityName, isSelected]);

  const resetContents = useCallback(() => {
    setData((prev) => ({ ...prev, contents: [] }));
  }, []);

  const fetchEntityScores = useCallback(async (
    scoreType: string,
    timeframeFrom: string,
    timeframeTo: string
  ) => {
    if (!entityName) return;
    setIsLoadingScores(true);
    const fetchId = ++fetchIdRef.current;

    try {
      const defaultTimeframe = {
        from: '2023-01-01',
        to: '2025-12-31'
      };

      console.log('Fetching scores with:', { 
        entityName, 
        scoreType, 
        timeframeFrom: defaultTimeframe.from, 
        timeframeTo: defaultTimeframe.to 
      });

      const response = await fetch(
        `/api/v1/entities/score_over_time/${encodeURIComponent(entityName)}?` + 
        `score_type=${encodeURIComponent(scoreType)}` +
        `&timeframe_from=${defaultTimeframe.from}` +
        `&timeframe_to=${defaultTimeframe.to}`
      );

      if (!response.ok) throw new Error('Failed to fetch entity scores');
      const fetchedData = await response.json();
      
      if (fetchId === fetchIdRef.current) {
        setScoreData({
          scores: fetchedData,
          entity: entityName,
          scoreType
        });
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
      if (fetchId === fetchIdRef.current) {
        setScoreError(error as Error);
      }
    } finally {
      if (fetchId === fetchIdRef.current) {
        setIsLoadingScores(false);
      }
    }
  }, [entityName]);

  return {
    data,
    isLoading,
    error,
    fetchContents,
    resetContents,
    scoreData,
    isLoadingScores,
    scoreError,
    fetchEntityScores,
  };
}

export function mapLabelToStatus(label: string): string {
  switch (label) {
    case 'red':
      return 'rejected';
    case 'yellow':
      return 'pending';
    case 'green':
      return 'accepted';
    default:
      return 'unknown';
  }
}
