'use client'
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { ThemeProvider } from 'next-themes';
import { Button } from '@/components/ui/button';
import Search from '@/components/Search';
import { OpenAPI } from 'src/client';
import { Map, FileSearch2, Globe as GlobeIcon, Search as SearchIcon, RefreshCcw } from 'lucide-react'; // Added RefreshCcw icon
import { Settings, HelpCircle } from 'lucide-react';
import withAuth from '@/hooks/withAuth';
import LocationDetailPanel from '@/components/LocationDetailPanel';
import { SSAREDashboard } from '../hq/page';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { ChatWithContext } from '@/components/ChatWithContext';
import { BookmarkedArticles } from '@/components/BookMarkedArticles';
import Globe from '@/components/gGlobe';
import { useLayoutStore } from '@/store/useLayoutStore'; // Import Zustand store

// const Globe = dynamic(() => import('@/components/Globe'), { ssr: false });

console.log(process.env.NEXT_PUBLIC_API_URL);

const Desk: React.FC = () => {
    const geojsonUrl = '/api/v1/locations/geojson/';
    const [results, setResults] = useState(null);
    const [summary, setSummary] = useState<string>('');
    const [articleContent, setArticleContent] = useState<string>('');
    const [location, setLocation] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleString());
    const [isBrowseMode, setIsBrowseMode] = useState(true);
    const [isDashboardVisible, setIsDashboardVisible] = useState(false);
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
    setCountry(locationName); // Set country when location is clicked
    setIsVisible(true);
    setHasClicked(true);
    setLocationKey(prevKey => prevKey + 1);
    setActiveTab('articles'); // Set to default tab when clicking a location
    console.log('Location clicked:', locationName);
  };

  const handleSearch = (searchResults: any) => {
    setResults(searchResults);
    setLastSearchResults(searchResults);
    setIsBrowseMode(false);
    setHasSearched(true);
    setHasEverSearched(true);
    setIsVisible(true);
    setHasClicked(true);
    setActiveTab('search-results');

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

  const toggleDashboard = () => {
    setIsDashboardVisible(!isDashboardVisible);
  };

  const toggleVisibility = () => {
    setIsVisible(false); // Hide the panel
    setHasClicked(false); // Reset the clicked state
    setLocation(null); // Optionally reset the location if needed
    setActiveTab(''); // Reset active tab if necessary
    setHasSearched(false); // Reset hasSearched to revert layout to single column
  };

  const toggleView = () => {
    if (hasSearched) {
      setHasSearched(false);
      setResults(null);
      setActiveTab('articles'); // Reset to default tab when toggling view
    } else {
      setHasSearched(true);
      setResults(lastSearchResults);
      setActiveTab('search-results'); // Set to search results tab when toggling view
    }
  };

  const handleReload = () => {
    window.location.reload(); // Reload the page
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="relative w-full h-screen max-h-screen">
        <div className={`absolute ${isMobile ? 'top-0 hidden' : 'top-6 block'} left-8 z-[10]`}> 
          <h1 suppressHydrationWarning className="text-sm text-gray-400">{currentTime}</h1>
        </div>

        {/* Main content area - always showing globe and search */}
        <div className="relative w-full h-full overflow-x-hidden">
          <motion.div
            className={`absolute h-2/3 p-4 ${hasClicked || isVisible ? 'w-1/2' : 'w-full'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Globe
              ref={globeRef}
              geojsonUrl={geojsonUrl}
              setArticleContent={setArticleContent}
              onLocationClick={handleLocationClick}
              isBrowseMode={isBrowseMode}
              toggleMode={toggleMode}
              setLegislativeData={setLegislativeData}
              setEconomicData={setEconomicData}
              onCountryZoom={handleLocationZoom}
            />
          </motion.div>
          
          <motion.div
            className={`absolute ${isMobile ? 'top-2/3 transform -translate-x-1/2 w-full' : `${hasClicked && isVisible ? 'top-2/3 left-2 transform -translate-x-1/2 -translate-y-1/2 w-1/2' : 'top-2/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-1/2'}`} px-0`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Search
              setResults={handleSearch}
              setCountry={setCountry}
              setSummary={handleSummary}
              globeRef={globeRef}
            />
          </motion.div>

          {/* Side panel */}
          {hasClicked && (
            <motion.div
              className={`absolute ${isMobile ? 'top-0' : 'top-0'} right-0 max-h-screen ${isMobile ? 'max-w-full' : 'w-1/2'}`}
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

        {/* Bottom buttons */}
        <motion.button
          onClick={handleReload}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white p-2 rounded-full shadow-lg"
        >
          <RefreshCcw size={24} />
        </motion.button>
        <motion.div className="fixed bottom-4 left-3/4 transform -translate-x-1/2">
          <BookmarkedArticles />
        </motion.div>
      </div>
    </ThemeProvider>
  );
};

export default Desk;
