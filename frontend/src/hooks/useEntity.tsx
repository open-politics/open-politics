import { useState, useEffect, useCallback } from 'react';
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
  classification: any | null;
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

  const fetchContents = useCallback(async (skip: number, limit: number) => {
    if (!entityName || !isSelected) return; // Fetch only if an entity is selected
    setIsLoading((prev) => ({ ...prev, contents: true }));
    try {
      const response = await fetch(`/api/v1/locations/${entityName}/entities/contents?skip=${skip}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contents');
      }
      const data = await response.json();
      setData((prev) => ({
        ...prev,
        contents: skip === 0 ? data : [...prev.contents, ...data],
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

  return {
    data,
    isLoading,
    error,
    fetchContents,
    resetContents,
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
