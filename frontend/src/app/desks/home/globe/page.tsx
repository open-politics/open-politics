'use client'
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { RefreshCcw } from 'lucide-react';
import { Slash } from 'lucide-react';
import Globe from '@/components/gGlobe';
import Search from '@/components/Search';
import LocationDetailPanel from '@/components/LocationDetailPanel';
import { BookmarkedArticles } from '@/components/BookMarkedArticles';
import { useLayoutStore } from '@/store/useLayoutStore';
import { useArticleTabNameStore } from '@/hooks/useArticleTabNameStore';

const GlobePage = () => {
  const geojsonUrl = '/api/v1/locations/geojson/';
  const [results, setResults] = useState(null);
  const [summary, setSummary] = useState<string>('');
  const [articleContent, setArticleContent] = useState<string>('');
  const [location, setLocation] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleString());
  const [isBrowseMode, setIsBrowseMode] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const globeRef = useRef<any>(null);
  const [legislativeData, setLegislativeData] = useState([]);
  const [economicData, setEconomicData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const { toast } = useToast();
  const [locationKey, setLocationKey] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const [lastSearchResults, setLastSearchResults] = useState(null);
  const [hasEverSearched, setHasEverSearched] = useState(false);
  const [country, setCountry] = useState<string | null>(null);
  const [searchTransitionComplete, setSearchTransitionComplete] = useState(false);

  // Access Zustand store
  const setActiveTab = useLayoutStore((state) => state.setActiveTab);

  const { setActiveTab: articleSetActiveTab } = useArticleTabNameStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsVisible(false);
        setHasClicked(false);
        setHasSearched(false); // Reset hasSearched when pressing Escape
      }
        if ((event.key === 'b' || event.key === 'B') && event.ctrlKey) {
        setIsVisible(true);
        setHasClicked(true);
      }
    };

    window.addEventListener('keydown', handleEscKey);

    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  const handleLocationClick = async (locationName: string) => {
    setLocation(locationName);
    setCountry(locationName);
    setIsVisible(true);
    setHasClicked(true);
    setLocationKey(prevKey => prevKey + 1);
    
    // Always switch to articles tab when clicking a location
    setActiveTab('articles');
    articleSetActiveTab('articles');
  };

  const handleSearch = (searchResults: any) => {
    setResults(searchResults);
    setLastSearchResults(searchResults);
    setIsBrowseMode(false);
    setHasSearched(true);
    setHasEverSearched(true);
    setIsVisible(true);
    setHasClicked(true);
    
    // Explicitly set to summary tab after search
    setActiveTab('summary');
    articleSetActiveTab('summary');

    toast({
      title: "Search Completed",
      description: "Your search results are now available.",
    });

    if (isMobile) {
      setTimeout(() => {
        window.scrollTo({ top: 100, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleLocationZoom = (latitude: number, longitude: number, locationName: string) => {
    if (globeRef.current) {
      globeRef.current.zoomToCountry(latitude, longitude, locationName);
    }
  };

  const handleSummary = (summary: string) => {
    setSummary(summary);
  };

  const toggleMode = () => {
    setIsBrowseMode(!isBrowseMode);
  };

  const toggleVisibility = () => {
    setIsVisible(false); // Hide the panel
    setHasClicked(false); // Reset the clicked state
    setLocation(null); // Optionally reset the location if needed
    setActiveTab(''); // Reset active tab if necessary
    setHasSearched(false); // Reset hasSearched to revert layout to single column
  };

  const handleReload = () => {
    window.location.reload(); // Reload the page
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      {/* Main Content Area */}
      <div className="flex h-full">
        {/* Globe Section */}
        <div className={`relative ${hasClicked || isVisible ? 'w-1/2' : 'w-full'} h-full transition-all duration-300 overflow-hidden`}>
          <div className="h-full">
            <Globe
              ref={globeRef}
              geojsonUrl={geojsonUrl}
              onLocationClick={handleLocationClick}
              onCountryZoom={handleLocationZoom}
            />
          </div>
          
          {/* Search Bar */}
          <div className="absolute top-3/4 mb-2 left-1/2 transform -translate-x-1/2 w-3/4">
            <Search
              setResults={handleSearch}
              setCountry={setCountry}
              setSummary={handleSummary}
              globeRef={globeRef}
            />
          </div>
        </div>

        {/* Details Panel */}
        {hasClicked && (
          <motion.div
            className="w-1/2 h-full"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
          >
            <LocationDetailPanel
              key={locationKey}
              location={location}
              isVisible={isVisible}
              toggleVisibility={toggleVisibility}
              results={results}
              summary={summary}
            />
          </motion.div>
        )}
      </div>

      {/* Fixed Position Elements */}
      <div className="fixed bottom-4 right-4 flex items-center gap-4">
        <motion.button
          onClick={handleReload}
          className="bg-primary text-primary-foreground p-2 rounded-full shadow-lg"
        >
          <RefreshCcw className="h-5 w-5" />
        </motion.button>
        <BookmarkedArticles />
      </div>
    </div>
  );
};

export default GlobePage;
