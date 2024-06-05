import React, { useState, useEffect } from 'react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import axios from 'axios';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SearchProps {
  setResults: (results: any) => void;
  setCountry: (country: string | null) => void;
  globeRef: React.RefObject<any>;
}

interface Country {
  country_name: string;
  country_code: string;
  latitude: number;
  longitude: number;
}
const Search: React.FC<SearchProps> = ({ setResults, setCountry, globeRef }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [wikipediaContent, setWikipediaContent] = useState<string>('');

  const handleSearch = async (query: string) => {
    fetchTavilySearchResults(query, setResults);
    setSearchQuery(query);

    const country = await fetchCountryFromQuery(query);

    setCountry(country);

    if (globeRef.current && country) {
      globeRef.current.zoomToCountry(country.latitude, country.longitude);
    }

    if (country) {
      const leaderInfoUrl = `http://localhost:8000/api/leaders/${country.country_name}/`;
      const wikipediaContent = await fetchWikipediaContent(country.country_name);
      setWikipediaContent(wikipediaContent); // Correctly set the Wikipedia content
      try {
        const leaderResponse = await axios.get(leaderInfoUrl);
        console.log('Leader info:', leaderResponse.data);
      } catch (error) {
        console.error('Error fetching leader info:', error);
      }
    }
  };

  const fetchWikipediaContent = async (countryName: string) => {
    try {
      const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${countryName}`);
      const data = await response.json();
      return data.extract ? `<div><strong>${countryName}</strong><br>${data.extract}</div>` : `<div><strong>${countryName}</strong>: No information available.</div>`;
    } catch (error) {
      console.error('Error fetching Wikipedia content:', error);
      return `<div><strong>${countryName}</strong>: Error fetching information.</div>`;
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

  const fetchTavilySearchResults = async (query: string, setResults: (results: any) => void) => {
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
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
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

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   console.log('Input value before update:', inputValue);
  //   setInputValue(e.target.value);
  //   console.log('Input value after update:', e.target.value);
  // };

  const handleSuggestionSelect = (query: string) => {
    console.log('Suggestion selected:', query);
    setInputValue(query);
    handleSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(inputValue);
    }
  };


  return (
    <div className="relative mt-8 ml-8 w-[300px] md:w-[550px] border bg-background rounded-lg p-2">
      <h2 className="text-xl font-bold mb-2">Search News and all things Politics</h2>
      <Command className="mx-auto">
        <CommandInput
          // onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          value={inputValue}
          onValueChange={setInputValue}
          placeholder="e.g. Economy of Oman"
        />
        <CommandList>
          <CommandGroup heading="Suggestions">
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(0, 255, 0, 0.8)" }}
              key="suggestion1"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('The economic situation of South Africa')}>
                The economic situation of South Africa
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(0, 255, 0, 0.8)" }}
              key="suggestion2"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('How has Iran positioned itself towards Ukraine?')}>
                How has Iran positioned itself towards Ukraine?
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(0, 255, 0, 0.8)" }}
              key="suggestion3"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('News from Singapore')}>
                News from Singapore
              </CommandItem>
            </motion.div>
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
          //  onChange={handleInputChange}
           onKeyDown={handleKeyDown}
           value={inputValue}
           onValueChange={setInputValue}
           placeholder="e.g. Economy of Oman"
        />
        <CommandList>
          <CommandGroup heading="Suggestions">
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion1"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('The economic situation of South Africa')}>
                The economic situation of South Africa
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion2"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('How has Iran positioned itself towards Ukraine?')}>
                How has Iran positioned itself towards Ukraine?
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion3"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('News from Singapore')}>
                News from Singapore
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion4"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Political climate in Brazil')}>
                Political climate in Brazil
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion5"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Climate change effects in the Arctic')}>
                Climate change effects in the Arctic
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion6"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Technological advancements in Japan')}>
                Technological advancements in Japan
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion7"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Healthcare system in Canada')}>
                Healthcare system in Canada
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion8"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Economic growth in India')}>
                Economic growth in India
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion9"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Tourism in Italy')}>
                Tourism in Italy
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion10"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Renewable energy in Germany')}>
                Renewable energy in Germany
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion11"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Education system in Finland')}>
                Education system in Finland
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion12"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Political unrest in Venezuela')}>
                Political unrest in Venezuela
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion13"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Space exploration initiatives in the USA')}>
                Space exploration initiatives in the USA
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion14"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Cultural heritage of Egypt')}>
                Cultural heritage of Egypt
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion15"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Wildlife conservation in Kenya')}>
                Wildlife conservation in Kenya
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion16"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Digital transformation in South Korea')}>
                Digital transformation in South Korea
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion17"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Agricultural practices in Australia')}>
                Agricultural practices in Australia
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion18"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Economic policies in China')}>
                Economic policies in China
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion19"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Social movements in France')}>
                Social movements in France
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion20"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Renewable energy initiatives in Norway')}>
                Renewable energy initiatives in Norway
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion21"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Urban development in the UAE')}>
                Urban development in the UAE
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion22"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Public transportation in the Netherlands')}>
                Public transportation in the Netherlands
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion23"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Economic reforms in Russia')}>
                Economic reforms in Russia
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion24"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Healthcare innovations in Sweden')}>
                Healthcare innovations in Sweden
              </CommandItem>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: "0px 0px 4px 2px rgba(255, 0, 0, 0.8), 0px 0px 4px 2px rgba(0, 255, 0, 0.8), 0px 0px 4px 2px rgba(0, 0, 255, 0.8)" }}
              key="dialog-suggestion25"
            >
              <CommandItem onSelect={() => handleSuggestionSelect('Cultural festivals in Spain')}>
                Cultural festivals in Spain
              </CommandItem>
            </motion.div>
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
