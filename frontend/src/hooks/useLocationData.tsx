import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface LocationData {
  legislativeData: any[];
  economicData: any[];
  leaderInfo: LeaderInfo | null;
  articles: Article[];
  entities: Entity[];
}

interface LeaderInfo {
  state?: string;
  headOfState?: string;
  headOfStateImage?: string | null;
  headOfGovernment?: string;
  headOfGovernmentImage?: string | null;
}

interface Entity {
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

export function useLocationData(locationName: string | null) {
  const [data, setData] = useState<LocationData>({
    legislativeData: [],
    economicData: [],
    leaderInfo: null,
    articles: [],
    entities: [],
  });
  const [isLoading, setIsLoading] = useState({
    legislative: false,
    economic: false,
    leaderInfo: false,
    articles: false,
    entities: false,
  });
  const [error, setError] = useState<{
    legislative: Error | null;
    economic: Error | null;
    leaderInfo: Error | null;
    articles: Error | null;
    entities: Error | null;
  }>({
    legislative: null,
    economic: null,
    leaderInfo: null,
    articles: null,
    entities: null,
  });

  const mapLeaderInfo = (rawData: any): LeaderInfo => ({
    state: rawData.State,
    headOfState: rawData['Head of State'],
    headOfStateImage: rawData['Head of State Image'],
    headOfGovernment: rawData['Head of Government'],
    headOfGovernmentImage: rawData['Head of Government Image'],
  });

  const fetchData = useCallback(async (dataType: keyof LocationData, url: string) => {
    if (!locationName) return;
  
    setIsLoading(prev => ({ ...prev, [dataType]: true }));
    try {
      const response = await axios.get(url);
      if (dataType === 'leaderInfo') {
        const mappedLeaderInfo = mapLeaderInfo(response.data);
        setData(prev => ({ ...prev, leaderInfo: mappedLeaderInfo }));
      } else {
        setData(prev => ({ ...prev, [dataType]: response.data }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, [dataType]: err instanceof Error ? err : new Error(`An error occurred fetching ${dataType}`) }));
    } finally {
      setIsLoading(prev => ({ ...prev, [dataType]: false }));
    }
  }, [locationName]);

  const fetchArticles = useCallback(async (searchQuery: string, skip: number) => {
    if (!locationName) return;
    setIsLoading((prev) => ({ ...prev, articles: true }));
    try {
      const response = await fetch(`/api/v1/locations/${locationName}/articles?search_query=${searchQuery}&skip=${skip}&limit=20`);
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
  }, [locationName]);

  const resetArticles = useCallback(() => {
    setData((prev) => ({ ...prev, articles: [] }));
  }, []);

  const fetchEntities = useCallback(async (skip: number, limit: number) => {
    if (!locationName) return;
    setIsLoading((prev) => ({ ...prev, entities: true }));
    try {
      const response = await fetch(`/api/v1/locations/${locationName}/entities?skip=${skip}&limit=${limit}`);
      console.log(response);
      if (!response.ok) {
        throw new Error('Failed to fetch entities');
      }
      const data = await response.json();
      setData((prev) => ({
        ...prev,
        entities: skip === 0 ? data : [...prev.entities, ...data],
      }));
    } catch (error) {
      setError((prev) => ({ ...prev, entities: error as Error }));
    } finally {
      setIsLoading((prev) => ({ ...prev, entities: false }));
    }
  }, [locationName]);

  const fetchCoordinates = useCallback(async (query: string) => {
    try {
      const response = await axios.get(`/api/v1/locations/location_from_query?query=${query}`);
      if (response.data.error) {
        return null;
      }
      return {
        longitude: response.data.longitude,
        latitude: response.data.latitude
      };
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (locationName) {
      fetchArticles('', 0);
      fetchData('legislativeData', `/api/v1/locations/legislation/${locationName}`);
      fetchData('economicData', `/api/v1/locations/econ_data/${locationName}`);
      fetchData('leaderInfo', `/api/v1/locations/leaders/${locationName}`);
      fetchEntities(0, 50);
    }
  }, [locationName, fetchArticles, fetchData, fetchEntities]);

  return {
    data,
    isLoading,
    error,
    fetchArticles,
    resetArticles,
    fetchEntities,
    fetchCoordinates,
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
