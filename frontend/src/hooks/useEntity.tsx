import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface EntityData {
  articles: Article[];
  details: EntityDetails | null;
}

interface EntityDetails {
  name: string;
  type: string;
  article_count: number;
  total_frequency: number;
  relevance_score: number;
}

interface Article {
  id: string;
  url: string;
  headline: string;
  source: string;
  insertion_date: string | null;
  paragraphs: string;
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
  classification: any | null;
}

export function useEntityData(entityName: string | null, isSelected: boolean) {
  const [data, setData] = useState<EntityData>({
    articles: [],
    details: null,
  });
  const [isLoading, setIsLoading] = useState({
    articles: false,
    details: false,
  });
  const [error, setError] = useState<{
    articles: Error | null;
    details: Error | null;
  }>({
    articles: null,
    details: null,
  });

  const fetchArticles = useCallback(async (skip: number, limit: number) => {
    if (!entityName || !isSelected) return; // Fetch only if an entity is selected
    setIsLoading((prev) => ({ ...prev, articles: true }));
    try {
      const response = await fetch(`/api/v1/locations/${entityName}/articles?skip=${skip}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json();
      setData((prev) => ({
        ...prev,
        articles: skip === 0 ? data : [...prev.articles, ...data],
      }));
    } catch (error) {
      setError((prev) => ({ ...prev, articles: error as Error }));
    } finally {
      setIsLoading((prev) => ({ ...prev, articles: false })); 
    }
  }, [entityName, isSelected]);

  const resetArticles = useCallback(() => {
    setData((prev) => ({ ...prev, articles: [] }));
  }, []);

  return {
    data,
    isLoading,
    error,
    fetchArticles,
    resetArticles,
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
