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
import CountryDetailPanel from '@/components/CountryDetailPanel';
import { Map, FileSearch2 } from 'lucide-react';
import { Settings, HelpCircle } from 'lucide-react';
import withAuth from '@/hooks/withAuth';

const Globe = dynamic(() => import('@/components/Globe'), { ssr: false });

OpenAPI.BASE = process.env.BACKEND_URL != null
  ? "http://backend:80/api"
  : `https://${process.env.BACKEND_URL}/api`;

OpenAPI.TOKEN = async () => {
  return localStorage.getItem("access_token") || "";
};

const Desk: React.FC = () => {
    const geojsonUrl = `${process.env.}/api/v1/countries/geojson/`;
    const [results, setResults] = useState(null);
    const [summary, setSummary] = useState<string>('');
    const [articleContent, setArticleContent] = useState<string>('');
    const [country, setCountry] = useState<string | null>(null);
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
    const [countryKey, setCountryKey] = useState<number>(0);
    const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768); // Consider mobile if width is less than 768px
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCountryClick = async (countryName: string) => {
    setCountry(countryName);
    setIsVisible(true);
    setHasClicked(true);
    setCountryKey(prevKey => prevKey + 1);
  };

  useEffect(() => {
    const preventFocus = (e: TouchEvent) => {
      if (isMobile && !hasSearched) {
        e.preventDefault();
      }
    };

    const searchInput = document.querySelector('input[type="search"]');
    if (searchInput) {
      searchInput.addEventListener('touchstart', preventFocus, { passive: false });
    }

    return () => {
      if (searchInput) {
        searchInput.removeEventListener('touchstart', preventFocus);
      }
    };
  }, [isMobile, hasSearched]);

  const handleSearch = (searchResults: any) => {
    setResults(searchResults);
    setIsBrowseMode(false);
    setHasSearched(true);
    toast({
      title: "Search Completed",
      description: "Your search results are now available.",
    });

    // Scroll down slightly after search on mobile
    if (isMobile) {
      setTimeout(() => {
        window.scrollTo({ top: 100, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleCountryZoom = (latitude: number, longitude: number, countryName: string) => {
    if (globeRef.current) {
      globeRef.current.zoomToCountry(latitude, longitude, countryName);
    }
  };

  const handleSummary = (summary: string) => {
    setSummary(summary);
  };

  const toggleMode = () => {
    setIsBrowseMode(!isBrowseMode);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    setHasClicked(false);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="relative w-full h-screen overflow-hidden overflow-x-hidden">
        <div className="absolute top-2 left-8 z-50">
          <h1 suppressHydrationWarning className="text-sm text-gray-400">{currentTime}</h1>
        </div>
        
        {!hasSearched ? (
          <div className="relative w-full h-full overflow-x-hidden">
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Globe
                ref={globeRef}
                geojsonUrl={geojsonUrl}
                setArticleContent={setArticleContent}
                onCountryClick={handleCountryClick}
                isBrowseMode={isBrowseMode}
                toggleMode={toggleMode}
                setLegislativeData={setLegislativeData}
                setEconomicData={setEconomicData}
                onCountryZoom={handleCountryZoom}
              />
            </motion.div>
            <motion.div
                className={`absolute ${isMobile ? 'top-[calc(50%+100px)] transform -translate-x-1/2 w-full' : 'top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-1/2'} px-0`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Search setResults={handleSearch} setCountry={setCountry} globeRef={globeRef} setSummary={handleSummary} />
            </motion.div>
            <AnimatePresence>
              {hasClicked && (
                <motion.div
                className={`absolute top-2 right-0 h-full ${isMobile ? 'w-3/4' : 'w-5/12'}`}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.3 }}
            >
                <CountryDetailPanel
                    key={countryKey}
                    country={country}
                    articleContent={articleContent}
                    isVisible={isVisible}
                    toggleVisibility={toggleVisibility}
                />
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        ) : (
          <div className={`${isMobile ? 'flex flex-col h-screen overflow-y-auto' : 'grid grid-cols-1 md:grid-cols-3 gap-2 h-full'}`}>
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
                  onCountryClick={handleCountryClick}
                  isBrowseMode={isBrowseMode}
                  toggleMode={toggleMode}
                  setLegislativeData={setLegislativeData}
                  setEconomicData={setEconomicData}
                  onCountryZoom={handleCountryZoom}
                />
              </motion.div>
              <motion.div
                className={`${isMobile ? 'w-full ml-4 mt-[-20px]' : 'max-h-5/6 overflow-y-auto w-full'}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Search setResults={handleSearch} setCountry={setCountry} globeRef={globeRef} setSummary={handleSummary} />
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
                  <CountryDetailPanel
                    key={countryKey}
                    country={country} // Add this line
                    articleContent={articleContent}
                    legislativeData={legislativeData}
                    economicData={economicData}
                    isVisible={isVisible}
                    toggleVisibility={toggleVisibility}
                  />
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};

export default Desk;