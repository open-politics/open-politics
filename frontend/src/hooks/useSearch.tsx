import { useState, useCallback } from 'react';
import axios from 'axios';
import { generateSummaryFromArticles } from '@/app/actions';
import { readStreamableValue } from 'ai/rsc';
import { useLocationData } from './useLocationData';
import { useCoordinatesStore } from '@/store/useCoordinatesStore';

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
  ssareResults: any;
}

interface UseSearchReturn {
  search: (query: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
  results: SearchResults | null;
  summary: string;
}

export function useSearch(
  setResults: (results: any) => void,
  setCountry?: (country: string | null) => void,
  setSummary?: (summary: string) => void,
  globeRef?: React.RefObject<any>,
  initialFilters: SearchFilters = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchType, setSearchType] = useState<SearchType>('semantic');
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [analysisType, setAnalysisType] = useState('Conflict Analysis');

  const { fetchCoordinates } = useLocationData(null);
  const setCoordinates = useCoordinatesStore((state) => state.setCoordinates);

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

  const fetchSSAREContents = async (query: string) => {
    try {
      const response = await axios.get(`/api/v1/search/contents`, {
        params: {
          search_query: query,
          limit: 20,
          skip: 0,
          search_type: searchType,
          ...filters
        }
      });
      // Remove duplicates based on article ID
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
      console.error('Error fetching SSARE articles:', error);
      return [];
    }
  };

  const fetchLocationFromNLQuery = async (query: string) => {
    try {
      const response = await axios.get(`/api/v1/locations/location_from_query?query=${query}`);
      if (response.data.error) return null;
      return response.data;
    } catch (error) {
      return null;
    }
  };

  const search = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Start country detection early and in parallel
      const countryPromise = fetchLocationFromNLQuery(query);

      // Fetch search results in parallel
      const [tavilyResults, ssareResults] = await Promise.all([
        fetchTavilySearchResults(query),
        fetchSSAREContents(query)
      ]);

      // Set results immediately
      const combinedResults = { tavilyResults, ssareResults };
      setResults(combinedResults);

      // Handle country detection and globe zoom independently
      countryPromise.then(async (country) => {
        if (country && setCountry) {
          setCountry(country.country_name);
          
          const coordinates = await fetchCoordinates(query);
          if (coordinates) {
            setCoordinates(coordinates.longitude, coordinates.latitude);
            
            // Direct ref call if available
            if (globeRef?.current?.zoomToCountry) {
              globeRef.current.zoomToCountry(
                coordinates.latitude,
                coordinates.longitude,
                country.country_name
              );
            }
          }
        }
      }).catch(console.error);

      // Handle summary generation independently
      if (setSummary) {
        const tavilyArticles = tavilyResults.results.map((result: any) => ({ content: result.content }));
        generateSummaryFromArticles(tavilyArticles, ssareResults, analysisType)
          .then(async ({ output }) => {
            let fullSummary = '';
            for await (const delta of readStreamableValue(output)) {
              fullSummary += delta;
              setSummary(fullSummary);
            }
          })
          .catch(console.error);
      }

    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred during search'));
    } finally {
      setLoading(false);
    }
  }, [setResults, setSummary, setCountry, globeRef, filters, searchType, analysisType]);

  return {
    search,
    loading,
    error,
    setFilters,
    setSearchType,
    setAnalysisType
  };
}
