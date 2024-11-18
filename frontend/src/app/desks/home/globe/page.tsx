'use client'
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { RefreshCcw } from 'lucide-react';
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
  const [location, setLocation] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleString());
  const [isBrowseMode, setIsBrowseMode] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const globeRef = useRef<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const { toast } = useToast();
  const [locationKey, setLocationKey] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const { setActiveTab: layoutSetActiveTab } = useLayoutStore();
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
    setIsVisible(true);
    setHasClicked(true);
    setLocationKey(prevKey => prevKey + 1);
    
    // Always switch to articles tab when clicking a location
    layoutSetActiveTab('articles');
    articleSetActiveTab('articles');
  };

  const handleSearch = (searchResults: any) => {
    setResults(searchResults);
    setIsBrowseMode(false);
    setHasSearched(true);
    setIsVisible(true);
    setHasClicked(true);
    
    // Explicitly set to summary tab after search
    layoutSetActiveTab('summary');
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

  const toggleVisibility = () => {
    setIsVisible(false); // Hide the panel
    setHasClicked(false); // Reset the clicked state
    setLocation(null); // Optionally reset the location if needed
    layoutSetActiveTab(''); // Reset active tab if necessary
    setHasSearched(false); // Reset hasSearched to revert layout to single column
  };

  const handleReload = () => {
    window.location.reload(); // Reload the page
  };

  return (
    <div className="h-screen w-full relative">
      {/* Main Content Area */}
      <div className="flex h-full flex-col md:flex-row">
        {/* Globe Section */}
        <div className="relative flex-1 h-[calc(100vh-8rem)] min-h-1/2 transition-all duration-300 overflow-hidden">
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
              setSummary={handleSummary}
              globeRef={globeRef}
            />
          </div>
        </div>

        {/* Details Panel for Desktop */}
        <AnimatePresence>
          {!isMobile && hasClicked && (
            <motion.div
              className={`w-1/2 block md:block max-h-[calc(100vh-8rem)] overflow-y-auto`}
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
        </AnimatePresence>
      </div>

      {/* Overlay Detail Panel for Mobile */}
      <AnimatePresence>
        {isMobile && hasClicked && isVisible && (
          <motion.div
            className="fixed inset-0 bg-background/45 backdrop-blur supports-[backdrop-filter]:bg-background/60flex justify-center items-center z-50 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-background dark:bg-opacity-90 rounded-lg w-full h-full md:w-1/2 md:h-auto overflow-auto pt-4 md:pt-0"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
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
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default GlobePage;