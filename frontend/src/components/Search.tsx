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


interface SearchProps {
  setResults: (results: any) => void;
  setCountry: (country: string | null) => void;
  setSummary: (summary: string) => void;
  globeRef: React.RefObject<any>;
}

const Search: React.FC<SearchProps> = ({ setResults, setCountry, setSummary, globeRef }) => {
  const [inputValue, setInputValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSearch = async (query: string) => {
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

      if (globeRef.current && country) {
        globeRef.current.zoomToCountry(country.latitude, country.longitude);
      }
    } catch (error) {
      console.error('Error in handleSearch:', error);
    }
  };

  const fetchTavilySearchResults = async (query: string) => {
    const apiKey = "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"; // Replace with your actual API key
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
      console.log('Search results:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching search results:', error);
      return null;
    }
  };

  const fetchCountryFromQuery = async (query: string) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/country_from_query?query=${query}`);
      console.log('Country response:', response.data);
      if (response.data.error) {
        console.error('Error fetching country data:', response.data.error);
        return null;
      }
      return {
        country_name: response.data.country_name,
        country_code: response.data.country_code,
        latitude: response.data.latitude,
        longitude: response.data.longitude
      };
    } catch (error) {
      console.error('Error fetching country data:', error);
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
    console.log('Suggestion selected:', query);
    setInputValue(query);
    handleSearch(query);
  };

  return (
    <div className="relative mt-8 ml-8 w-[300px] md:w-[550px] border bg-background rounded-lg p-2">
      <h2 className="text-xl font-bold mb-2">Search News and all things Politics</h2>
      <Command className="mx-auto">
        <CommandInput
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(inputValue)}
          value={inputValue}
          onValueChange={setInputValue}
          placeholder="e.g. Economy of Oman"
        />
        <CommandList>
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
        <CommandInput
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(inputValue)}
          value={inputValue}
          onValueChange={setInputValue}
          placeholder="e.g. Economy of Oman"
        />
        <CommandList>
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
          <CommandSeparator />
          <CommandGroup heading="Recent Searches">
            {/* You can add recent search items here if needed */}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default Search;
