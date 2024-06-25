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

interface SearchProps {
  setResults: (results: any) => void;
  setCountry: (country: string | null) => void;
  setSummary: (summary: string) => void;
  globeRef: React.RefObject<any>;
}

const Search: React.FC<SearchProps> = ({ setResults, setCountry, setSummary, globeRef }) => {

  const [inputValue, setInputValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const results = await fetchTavilySearchResults(query);
      setResults(results);

      const articles = results.results.map((result: any) => ({ content: result.content }));
      const { output } = await generateSummaryFromArticles(articles);
      let fullSummary = '';
      for await (const delta of readStreamableValue(output)) {
        fullSummary += delta;
        setSummary(fullSummary);
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

  const fetchCountryFromQuery = async (query: string) => {
    try {
      const response = await axios.get(`https://open-politics.org/api/v1/countries/country_from_query?query=${query}`);
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
    <div className="relative mt-2 w-full md:w-2/3 px-4">
      <h2 className="text-xl font-bold mb-2">Search News and all things Politics</h2>
      <Command className="mx-auto">
        <div className="relative">
          <CommandInput
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(inputValue)}
            value={inputValue}
            onValueChange={setInputValue}
            placeholder="e.g. Economy of Oman"
            style={{ fontSize: '16px' }}
          />
          <Button onClick={() => handleSearch(inputValue)} className="absolute bg-[#BED4FF] dark:bg-sky-700 dark:bg-[#D2FFD9] right-2 top-0 h-8">Search</Button>
        </div>
        {loading && <div className="spinner">Loading...</div>}
        <div className="absolute right-2 top-2 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                {dropdownOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Analysis Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => console.log('Conflict Analysis')}>Conflict Analysis</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => console.log('News Analysis')}>News Analysis</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => console.log('Economic Analysis')}>Economic Analysis</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CommandList className="hidden md:block">
          <div className="hidden md:block">
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
          <CommandSeparator />
          <CommandGroup heading="Method Focus">
            <RadioGroup defaultValue="option-one">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-one" id="option-one" />
                <Label htmlFor="option-one">Conflict Analysis</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-two" id="option-two" />
                <Label htmlFor="option-two">News Analysis</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-three" id="option-three" />
                <Label htmlFor="option-three">Economic Analysis</Label>
              </div>
            </RadioGroup>
          </CommandGroup>
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
          <div className="hidden md:block">
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
          <CommandSeparator />
          <CommandGroup heading="Recent Searches">
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default Search;
