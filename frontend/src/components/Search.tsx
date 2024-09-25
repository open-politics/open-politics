import React, { useState, useEffect } from 'react';
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from 'axios';
import { generateSummaryFromArticles } from '@/app/actions';
import { readStreamableValue } from 'ai/rsc';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button"
import SpinningBrainLoader from './SpinningImageLoader';
import LottieLoader from './LottieLoader';

interface SearchProps {
  setResults: (results: any) => void;
  setCountry?: (country: string | null) => void;
  setSummary: (summary: string) => void;
  globeRef: React.RefObject<any>;
}
import { ArticleCardProps } from '@/components/ArticleCard';

const Search: React.FC<SearchProps> = ({ setResults, setCountry, setSummary, globeRef }) => {
  const [inputValue, setInputValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState('Conflict Analysis');
  const [searchType, setSearchType] = useState('semantic');
  const [includeSummary, setIncludeSummary] = useState(false);
  const [entities, setEntities] = useState('');
  const [locations, setLocations] = useState('');
  const [classificationScores, setClassificationScores] = useState('');
  const [topics, setTopics] = useState('');
  const [keywords, setKeywords] = useState('');
  const [keywordWeights, setKeywordWeights] = useState<{ [key: string]: number }>({});
  const [excludeKeywords, setExcludeKeywords] = useState<string[]>([]);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const [tavilyResults, ssareResults] = await Promise.all([
        fetchTavilySearchResults(query),
        fetchSSAREArticles(query)
      ]);

      const combinedResults = {
        tavilyResults,
        ssareResults
      };
      setResults(combinedResults);

      if (includeSummary) {
        const tavilyArticles = tavilyResults.results.map((result: any) => ({ content: result.content }));
        const { output } = await generateSummaryFromArticles(tavilyArticles, ssareResults, analysisType);
        let fullSummary = '';
        for await (const delta of readStreamableValue(output)) {
          fullSummary += delta;
          setSummary(fullSummary);
        }
      }

      const country = await fetchCountryFromQuery(query);
      setCountry(country?.country_name);

      if (country && globeRef.current) {
        globeRef.current.zoomToCountry(country.latitude, country.longitude, country.country_name);
      }
    } catch (error) {
      console.error('Error in handleSearch:', error);
    } finally {
      setLoading(false);
    }
  };

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
      console.error('Error fetching search results:', error);
      return null;
    }
  };
  
  const fetchSSAREArticles = async (query: string) => {
    try {
      const response = await axios.get(`/api/v1/search/articles`, {
        params: {
          search_query: query,
          limit: 8,
          skip: 0,
          search_type: searchType,
          entities: entities,
          locations: locations,
          classification_scores: classificationScores,
          topics: topics,
          keyword: keywords
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching SSARE articles:', error);
      return [];
    }
  };

  const fetchCountryFromQuery = async (query: string) => {
    try {
      const response = await axios.get(`/api/v1/locations/location_from_query?query=${query}`);
      if (response.data.error) {
        return null;
      }
      return {
        country_name: response.data.country_name,
        latitude: response.data.latitude,
        longitude: response.data.longitude
      };
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setDialogOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSuggestionSelect = (query: string) => {
    setInputValue(query);
    handleSearch(query);
  };

  return (
    <div className="relative w-full bg-white dark:bg-black bg-opacity-20 dark:bg-opacity-20 backdrop-blur-lg rounded-lg p-2 px-4">
      <h2 className="text-xl font-bold text-blue-500 dark:text-green-200 mb-2">Search News and all things Politics</h2>
      <Command className="mx-auto bg-transparent">
        <div className="relative">
          <CommandInput
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(inputValue)}
            value={inputValue}
            onValueChange={setInputValue}
            placeholder="e.g. Economy of Oman"
            style={{ fontSize: '16px' }}
          />
          <Button 
            onClick={() => handleSearch(inputValue)} 
            className="absolute bg-[#BED4FF] dark:bg-sky-700 dark:bg-[#D2FFD9] right-2 top-1/4 sm:top-1 h-8 md:h-8 h-6 md:text-base text-xs"
          >
            Search
          </Button>
        </div>
        {loading && (
          <div className="absolute left-0 right-0 flex justify-center mt-24">
            <LottieLoader />
          </div>
        )}
        <div className="absolute right-2 top-1 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                {dropdownOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Analysis Type</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => console.log('Conflict Analysis')}>Conflict Analysis</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => console.log('News Analysis')}>News Analysis</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => console.log('Economic Analysis')}>Economic Analysis</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CommandList className="md:block">
          <div className="md:block">
            <CommandGroup heading="Method Focus">
              <RadioGroup 
                defaultValue="Conflict Analysis" 
                onValueChange={(value) => setAnalysisType(value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Conflict Analysis" id="conflict-analysis" />
                  <Label htmlFor="conflict-analysis">Conflict Analysis</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="News Analysis" id="news-analysis" />
                  <Label htmlFor="news-analysis">News Analysis</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Economic Analysis" id="economic-analysis" />
                  <Label htmlFor="economic-analysis">Economic Analysis</Label>
                </div>
              </RadioGroup>
            </CommandGroup>
            <CommandSeparator className="mt-2" />
            <CommandGroup heading="Search Type">
              <RadioGroup 
                defaultValue="semantic" 
                onValueChange={(value) => setSearchType(value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="semantic" id="semantic" />
                  <Label htmlFor="semantic">Semantic</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="text" />
                  <Label htmlFor="text">Text</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="structured" id="structured" />
                  <Label htmlFor="structured">Structured</Label>
                </div>
              </RadioGroup>
            </CommandGroup>
            <CommandSeparator className="mt-2" />
            <CommandGroup heading="Suggestions">
              <CommandItem onSelect={() => handleSuggestionSelect('The economic situation of South Africa')}>
                The economic situation of South Africa
              </CommandItem>
              <CommandItem onSelect={() => handleSuggestionSelect('How has Iran positioned itself towards Ukraine?')}>
                How has Iran positioned itself towards Ukraine?
              </CommandItem>
              <CommandItem onSelect={() => handleSuggestionSelect('News from Singapore')}>
                News from Singapore
              </CommandItem>
              <CommandItem onSelect={() => handleSuggestionSelect('Political climate in Brazil')}>
                Political climate in Brazil
              </CommandItem>
            </CommandGroup>
          </div>
        </CommandList>
      </Command>
      <CommandDialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
        <div className="relative">
          <CommandInput
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(inputValue)}
            value={inputValue}
            onValueChange={setInputValue}
            placeholder="e.g. Economy of Oman"
            style={{ fontSize: '16px' }}
          />
          <Button onClick={() => handleSearch(inputValue)} className="absolute right-2 top-1/2 transform -translate-y-1/2" size="sm">Search</Button>
        </div>
        <CommandList>
          <div className="md:block">
            <CommandGroup heading="Suggestions">
              <CommandItem onSelect={() => handleSuggestionSelect('The economic situation of South Africa')}>
                The economic situation of South Africa
              </CommandItem>
              <CommandItem onSelect={() => handleSuggestionSelect('How has Iran positioned itself towards Ukraine?')}>
                How has Iran positioned itself towards Ukraine
              </CommandItem>
              <CommandItem onSelect={() => handleSuggestionSelect('News from Singapore')}>
                News from Singapore
              </CommandItem>
              <CommandItem onSelect={() => handleSuggestionSelect('Political climate in Brazil')}>
                Political climate in Brazil
              </CommandItem>
            </CommandGroup>
          </div>
          <CommandSeparator />
          <CommandGroup heading="Recent Searches">
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      <div className="mt-4 flex items-center space-x-2">
        <input
          type="checkbox"
          id="include-summary"
          checked={includeSummary}
          onChange={(e) => setIncludeSummary(e.target.checked)}
        />
        <Label htmlFor="include-summary">Include AI Summary</Label>
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          id="entities"
          value={entities}
          onChange={(e) => setEntities(e.target.value)}
          placeholder="Filter by entities (comma-separated)"
        />
        <Label htmlFor="entities">Entities</Label>
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          id="locations"
          value={locations}
          onChange={(e) => setLocations(e.target.value)}
          placeholder="Filter by locations (comma-separated)"
        />
        <Label htmlFor="locations">Locations</Label>
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          id="classification-scores"
          value={classificationScores}
          onChange={(e) => setClassificationScores(e.target.value)}
          placeholder="Filter by classification scores (JSON)"
        />
        <Label htmlFor="classification-scores">Classification Scores</Label>
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          id="topics"
          value={topics}
          onChange={(e) => setTopics(e.target.value)}
          placeholder="Filter by topics (comma-separated)"
        />
        <Label htmlFor="topics">Topics</Label>
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          id="keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="Filter by keywords"
        />
        <Label htmlFor="keywords">Keywords</Label>
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          id="keyword-weights"
          value={Object.entries(keywordWeights).map(([key, value]) => `${key}:${value}`).join(', ')}
          onChange={(e) => {
            const weights = e.target.value.split(',').reduce((acc, pair) => {
              const [key, value] = pair.split(':');
              acc[key.trim()] = parseFloat(value.trim());
              return acc;
            }, {} as { [key: string]: number });
            setKeywordWeights(weights);
          }}
          placeholder="Keyword weights (e.g. Berlin:2, Economy:1.5)"
        />
        <Label htmlFor="keyword-weights">Keyword Weights</Label>
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          id="exclude-keywords"
          value={excludeKeywords.join(', ')}
          onChange={(e) => setExcludeKeywords(e.target.value.split(',').map(k => k.trim()))}
          placeholder="Exclude keywords (comma-separated)"
        />
        <Label htmlFor="exclude-keywords">Exclude Keywords</Label>
      </div>
    </div>
  );
};

export default Search;