'use client'
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { ThemeProvider } from 'next-themes';
import { Button } from '@/components/ui/button';
import Search from '@/components/Search';
import Results from '@/components/Results';
import { OpenAPI } from 'src/client';
import { Map, FileSearch2, Globe as GlobeIcon, Search as SearchIcon, RefreshCcw } from 'lucide-react'; // Added RefreshCcw icon
import { Settings, HelpCircle } from 'lucide-react';
import withAuth from '@/hooks/withAuth';
import LocationDetailPanel from '@/components/LocationDetailPanel';
import { SSAREDashboard } from '../hq/page';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { ChatWithContext } from '@/components/ChatWithContext';
import { BookmarkedArticles } from '@/components/BookMarkedArticles';



const Globe = dynamic(() => import('@/components/Globe'), { ssr: false });

console.log(process.env.NEXT_PUBLIC_API_URL);

const Desk: React.FC = () => {
    const geojsonUrl = '/geojson';
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
      }
      if (event.key === 'b' || event.key === 'B') {
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
    setIsVisible(true);
    setHasClicked(true);
    setLocationKey(prevKey => prevKey + 1);
  };

  const handleSearch = (searchResults: any) => {
    setResults(searchResults);
    setLastSearchResults(searchResults);
    setIsBrowseMode(false);
    setHasSearched(true);
    setHasEverSearched(true);
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
    setIsVisible(!isVisible);
    setHasClicked(false);
  };

  const toggleView = () => {
    if (hasSearched) {
      setHasSearched(false);
      setResults(null);
    } else {
      setHasSearched(true);
      setResults(lastSearchResults);
    }
  };

  const handleReload = () => {
    window.location.reload(); // Reload the page
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="relative w-full h-screen overflow-hidden overflow-x-hidden">
        <div className="absolute top-2 left-8 z-50"> 
          <h1 suppressHydrationWarning className="text-sm text-gray-400">{currentTime}</h1>
        </div>
        
        {hasEverSearched && (
          <Button
            className="absolute top-8 left-8 z-50 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 bg-transparent hover:bg-transparent border-none"
            onClick={toggleView}
            variant="outline"
          >
            {hasSearched ? <GlobeIcon className="w-4 h-4 mr-2" /> : <SearchIcon className="w-4 h-4 mr-2" />}
            {hasSearched ? "Back to the Globe" : "View Last Search"}
          </Button>
        )}

        <AnimatePresence mode="wait">
          {!hasSearched ? (
            <motion.div
              key="globe-view"
              className="relative w-full h-full overflow-x-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className={`absolute inset-0 ${hasClicked && isVisible ? 'w-1/2' : 'w-full'}`}
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
                className={`absolute ${isMobile ? 'top-[calc(50%+100px)] transform -translate-x-1/2 w-full' : `${hasClicked && isVisible ? 'top-1/2 left-32 transform -translate-x-1/2 -translate-y-1/2 w-1/3' : 'top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-1/2'}`} px-0`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Search setResults={handleSearch} globeRef={globeRef} setSummary={handleSummary} />
              </motion.div>
              <AnimatePresence>
                {hasClicked && (
                  <motion.div
                    className={`absolute top-0 right-0 h-full ${isMobile ? 'max-w-full' : 'w-1/2'}`}
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
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="search-results-view"
              className={`${isMobile ? 'flex flex-col h-screen overflow-y-auto' : 'grid grid-cols-1 md:grid-cols-3 gap-2 h-full'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className={`${isMobile ? 'h-2/3 flex flex-col' : 'col-span-1'}`}>
                <motion.div
                  className="flex-1 relative"
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
                    // setEconomicData={setEconomicData}
                    onCountryZoom={handleLocationZoom}
                  />
                </motion.div>
                <motion.div
                  className={`${isMobile ? 'w-full ml-4 mt-[-20px]' : 'max-h-5/6 overflow-y-auto w-full'}`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Search setResults={handleSearch} globeRef={globeRef} setSummary={handleSummary} />
                </motion.div>
              </div>
              <motion.div
                className={`${isMobile ? 'min-h-screen flex flex-col mt-20' : 'col-span-2 flex flex-col'} ${!hasClicked || !isVisible ? 'md:col-span-2' : 'md:col-span-1'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}  
                transition={{ duration: 0.5 }}
              >
                <div className="flex-1 relative min-h-screen overflow-y-auto max-w-screen overflow-x-hidden">
                  <Results results={results} summary={summary} />
                </div>
              </motion.div>
              {hasClicked && isVisible && (
                <motion.div
                  className={`${isMobile ? 'fixed top-0 right-0 w-5/6 h-screen overflow-y-auto z-50' : 'col-span-1 flex flex-col'}`}
                  initial={{ opacity: 0, x: '100%' }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: '100%' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex-1 relative">
                    <LocationDetailPanel
                      key={locationKey}
                      location={location}
                      isVisible={isVisible}
                      toggleVisibility={toggleVisibility}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reload Button */}
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
      <AnimatePresence>
        {isDashboardVisible && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-0 left-0 right-0 h-5/6 bg-white dark:bg-gray-800 shadow-lg"
          >
            <SSAREDashboard />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={toggleDashboard}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isDashboardVisible ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
      </motion.button>
    </ThemeProvider>
  );
};

export default Desk;