import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface LocationData {
  legislativeData: any[];
  economicData: any[];
  leaderInfo: LeaderInfo | null;
  contents: Content[];
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
  content_count: number;
  total_frequency: number;
  relevance_score: number;
}

interface Content {
  id: string;
  title: string;
  text_content: string;
  url: string;
  source: string | null;
  insertion_date: string;
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
}

export function useLocationData(locationName: string | null) {
  const [data, setData] = useState<LocationData>({
    legislativeData: [],
    economicData: [],
    leaderInfo: null,
    contents: [],
    entities: [],
  });
  const [isLoading, setIsLoading] = useState({
    legislative: false,
    economic: false,
    leaderInfo: false,
    contents: false,
    entities: false,
  });
  const [error, setError] = useState<{
    legislative: Error | null;
    economic: Error | null;
    leaderInfo: Error | null;
    contents: Error | null;
    entities: Error | null;
  }>({
    legislative: null,
    economic: null,
    leaderInfo: null,
    contents: null,
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

  const fetchContents = useCallback(async (searchQuery: string, skip: number) => {
    if (!locationName) return;
    setIsLoading((prev) => ({ ...prev, contents: true }));
    try {
      const response = await fetch(`/api/v1/locations/${locationName}/contents?search_query=${searchQuery}&skip=${skip}&limit=20`);
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
  }, [locationName]);

  const resetContents = useCallback(() => {
    setData((prev) => ({ ...prev, contents: [] }));
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

  const fetchEconomicData = useCallback(async () => {
    if (!locationName) return;
  
    setIsLoading(prev => ({ ...prev, economic: true }));
    try {
      const response = await axios.get(`/api/v1/locations/econ_data/${locationName}`);
      setData(prev => ({ ...prev, economicData: response.data }));
    } catch (err) {
      setError(prev => ({ ...prev, economic: err instanceof Error ? err : new Error('An error occurred fetching economic data') }));
    } finally {
      setIsLoading(prev => ({ ...prev, economic: false }));
    }
  }, [locationName]);

  useEffect(() => {
    if (locationName) {
      fetchContents('', 0);
      fetchData('legislativeData', `/api/v1/locations/legislation/${locationName}`);
      fetchData('leaderInfo', `/api/v1/locations/leaders/${locationName}`);
      fetchEntities(0, 50);
    }
  }, [locationName, fetchContents, fetchData, fetchEntities]);

  return {
    data,
    isLoading,
    error,
    fetchContents,
    resetContents,
    fetchEntities,
    fetchCoordinates,
    fetchEconomicData,
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
