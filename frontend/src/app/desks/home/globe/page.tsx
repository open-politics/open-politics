'use client'
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { RefreshCcw } from 'lucide-react';
import Globe from '@/components/collection/gGlobe';
import Search from '@/components/collection/Search';
import LocationDetailPanel from '@/components/collection/LocationDetailPanel';
import { BookmarkedArticles } from '@/components/collection/BookMarkedArticles';
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
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    // Simulate loading time for geojson data
    const loadingTimer = setTimeout(() => {
      setIsLoading(false); // Set loading to false after 3.5 seconds
    }, 3500);

    return () => clearTimeout(loadingTimer);
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
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="loader"></div>
        </div>
      ) : (
        <>
          {/* Main Content Area */}
          <div className="flex h-full flex-col md:flex-row">
            {/* Globe Section */}
            <div className="relative flex-1 h-[calc(100vh-8rem)] min-h-1/2 transition-all duration-300 overflow-hidden">
              <div className="h-full">
                <Globe
                  ref={globeRef}
                  geojsonUrl={geojsonUrl}
                  onLocationClick={handleLocationClick}
                />
              </div>
              
              {/* Search Bar */}
              <div className="absolute top-1/2 md:top-3/4 w-[80vw] md:w-1/3 left-[10vw] z-20">
                <Search
                  setResults={handleSearch}
                  setSummary={handleSummary}
                  globeRef={globeRef}
                />
              </div>
            </div>
          </div>

          {/* Overlay Detail Panel */}
          <AnimatePresence>
            {hasClicked && isVisible && (
              <motion.div
                className="fixed top-[18vh] right-0 min-w-[40vw] w-[80vw] md:max-w-[60vw] h-3/4 bg-background/90 mr-4 backdrop-blur-lg supports-[backdrop-filter]:bg-background/90 z-50 p-6 rounded-lg shadow-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="rounded-lg w-full h-full overflow-hidden shadow-lg"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="overflow-y-auto h-full scrollbar-hide">
                    <LocationDetailPanel
                      key={locationKey}
                      location={location}
                      isVisible={isVisible}
                      toggleVisibility={toggleVisibility}
                      results={results}
                      summary={summary}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default GlobePage;

<style jsx>{`
  .loader {
    border: 4px solid rgba(0, 0, 0, 0.1);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border-left-color: #3498db;
    animation: spin 1s ease infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`}</style>