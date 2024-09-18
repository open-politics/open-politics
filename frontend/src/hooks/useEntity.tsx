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
  paragraphs: string[];
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

export function useEntityData(entityName: string | null) {
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

  const fetchData = useCallback(async (dataType: keyof EntityData, url: string) => {
    if (!entityName) return;
  
    setIsLoading(prev => ({ ...prev, [dataType]: true }));
    try {
      const response = await axios.get(url);
      setData(prev => ({ ...prev, [dataType]: response.data }));
    } catch (err) {
      setError(prev => ({ ...prev, [dataType]: err instanceof Error ? err : new Error(`An error occurred fetching ${dataType}`) }));
    } finally {
      setIsLoading(prev => ({ ...prev, [dataType]: false }));
    }
  }, [entityName]);

  const fetchArticles = useCallback(async (skip: number, limit: number) => {
    if (!entityName) return;
    setIsLoading((prev) => ({ ...prev, articles: true }));
    try {
      const response = await fetch(`/articles_by_entity/${entityName}?skip=${skip}&limit=${limit}`);
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
  }, [entityName]);

  const resetArticles = useCallback(() => {
    setData((prev) => ({ ...prev, articles: [] }));
  }, []);

  useEffect(() => {
    if (entityName) {
      fetchArticles(0, 20);
      fetchData('details', `/api/v1/entities/${entityName}`);
    }
  }, [entityName, fetchArticles, fetchData]);

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