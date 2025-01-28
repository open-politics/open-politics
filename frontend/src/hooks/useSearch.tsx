import { useState, useCallback } from 'react';
import axios from 'axios';
import { generateSummaryFromArticles } from '../app/xactions';
import { readStreamableValue } from 'ai/rsc';
import { useLocationData } from './useLocationData';
import { useCoordinatesStore } from '@/store/useCoordinatesStore';
import { useArticleTabNameStore } from './useArticleTabNameStore';

export type SearchType = 'text' | 'semantic' | 'structured';

interface SearchFilters {
  newsCategory?: string;
  secondaryCategories?: string[];
  keyword?: string;
  entities?: string[];
  locations?: string[];
  topics?: string[];
  classificationScores?: Record<string, [number, number]>;
  keywordWeights?: Record<string, number>;
  excludeKeywords?: string[];
}

interface SearchResults {
  tavilyResults: any;
  opolResults: any;
}

interface UseSearchReturn {
  search: (query: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
  results: SearchResults | null;
  summary: string;
}

const calculateZoomLevel = (bbox: number[]): number => {
  if (!bbox || bbox.length !== 4) return 4;

  const width = Math.abs(bbox[2] - bbox[0]);
  const height = Math.abs(bbox[3] - bbox[1]);
  const area = width * height;

  if (area > 400) return 2;
  if (area > 100) return 3;
  if (area > 25) return 4;
  if (area > 5) return 5;
  if (area > 1) return 6;
  return 7;
};

export function useSearch(
  setResults: (results: any) => void,
  setCountry?: (country: string | null) => void,
  setSummary?: (summary: string) => void,
  globeRef?: React.RefObject<any>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchType, setSearchType] = useState<SearchType>('semantic');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [analysisType, setAnalysisType] = useState('Conflict Analysis');

  const { fetchCoordinates } = useLocationData(null);
  const setCoordinates = useCoordinatesStore((state) => state.setCoordinates);
  const setActiveTab = useArticleTabNameStore((state) => state.setActiveTab);

  const fetchTavilySearchResults = async (query: string) => {
    const apiKey = "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";
    const payload = {
      api_key: apiKey,
      query: query,
      search_depth: "advanced",
      include_answer: false,
      include_images: true,
      include_raw_content: false,
      max_results: 5,
      include_domains: [],
      exclude_domains: []
    };

    try {
      const response = await axios.post('https://api.tavily.com/search', payload);
      return response.data;
    } catch (error) {
      console.error('Error fetching Tavily search results:', error);
      return null;
    }
  };

  const fetchOPOLContents = async (query: string) => {
    try {
      const response = await axios.get(`/api/v2/articles/basic/`, {
        params: {
          query: query,
          limit: 20,
          skip: 0,
          search_type: searchType,
          ...filters
        }
      });
      const uniqueArticles = response.data.reduce((acc: any[], article: any) => {
        if (!acc.find((a: any) => a.id === article.id)) {
          acc.push({
            ...article,
            paragraphs: article.paragraphs || article.content || ''
          });
        }
        return acc;
      }, []);
      return uniqueArticles;
    } catch (error) {
      console.error('Error fetching opol articles:', error);
      return [];
    }
  };

  const fetchLocationFromNLQuery = async (query: string): Promise<LocationData | null> => {
    try {
      const response = await axios.get(`/api/v2/classification/location_from_query?query=${query}`);
      console.log("Location API response:", response.data);
      if (response.data.error) return null;
      
      const { coordinates, country_name, bbox, area, location_type } = response.data;
      const locationData = {
        country_name,
        coordinates: {
          latitude: coordinates[1],
          longitude: coordinates[0]
        },
        bbox,
        area,
        location_type: location_type || 'country'
      };
      console.log("Processed location data:", locationData);
      return locationData;
    } catch (error) {
      console.error("Error in fetchLocationFromNLQuery:", error);
      return null;
    }
  };

  const search = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const locationData = await fetchLocationFromNLQuery(query);
      console.log("Location API response:", locationData);
      
      if (locationData) {
        if (setCountry) {
          setCountry(locationData.country_name);
          setActiveTab('summary');
        }
        
        if (locationData.coordinates) {
          setCoordinates(locationData.coordinates.longitude, locationData.coordinates.latitude);
          
          const locationType = locationData.location_type || 'country';
          
          if (globeRef?.current?.zoomToLocation) {
            let dynamicZoom = 4;
            if (locationData.bbox) {
              dynamicZoom = calculateZoomLevel(locationData.bbox);
            }
            
            globeRef.current.zoomToLocation(
              locationData.coordinates.latitude,
              locationData.coordinates.longitude,
              locationData.country_name,
              locationData.bbox,
              locationType as 'continent' | 'country' | 'locality',
              dynamicZoom
            );
          }
        }
      }

      const [tavilyResults, opolResults] = await Promise.all([
        fetchTavilySearchResults(query),
        fetchOPOLContents(query)
      ]);

      const combinedResults = { tavilyResults, opolResults };
      setResults(combinedResults);
      setActiveTab('summary');

      if (setSummary) {
        try {
          const summaryResult = await generateSummaryFromArticles(combinedResults, analysisType);
          let fullSummary = '';
          
          for await (const delta of readStreamableValue(summaryResult.output)) {
            fullSummary += delta;
            setSummary(fullSummary);
          }
        } catch (summaryError) {
          console.error("Error generating summary:", summaryError);
          setSummary('Failed to generate summary.');
        }
      }

    } catch (err) {
      console.error("Error in search:", err);
      setError(err instanceof Error ? err : new Error('An error occurred during search'));
      setActiveTab('articles');
    } finally {
      setLoading(false);
    }
  }, [setResults, setSummary, setCountry, globeRef, filters, searchType, analysisType, setActiveTab, setCoordinates]);

  return {
    search,
    loading,
    error,
    setFilters,
    setSearchType,
    setAnalysisType
  };
}
