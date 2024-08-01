'use client'
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { ThemeProvider } from 'next-themes';
import { Button } from '@/components/ui/button';
import Search from '@/components/Search';
import Results from '@/components/Results';
import { OpenAPI } from 'src/client';
import CountryDetailPanel from '@/components/CountryDetailPanel';
import { Map, FileSearch2 } from 'lucide-react';
import { useSession } from "next-auth/react";
import { NewsHome } from '@/components/NewsHome';
import { ExpoTest } from '@/components/ExpoTest';

const Globe = dynamic(() => import('@/components/Globe'), { ssr: false });

// OpenAPI.BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
OpenAPI.TOKEN = async () => {
  return localStorage.getItem("access_token") || "";
};

const Desk: React.FC = () => {
  const geojsonUrl = 'https://open-politics.org/api/v1/countries/geojson/';
  const [results, setResults] = useState(null);
  const [summary, setSummary] = useState<string>('');
  const [articleContent, setArticleContent] = useState<string>('');
  const [country, setCountry] = useState<string | null>(null);
  const [leaderInfo, setLeaderInfo] = useState<any | null>(null);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleString());
  const [isBrowseMode, setIsBrowseMode] = useState(true);
  const globeRef = useRef<any>(null);
  const [legislativeData, setLegislativeData] = useState([]);
  const [economicData, setEconomicData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const { toast } = useToast();
  const [newsHomeData, setNewsHomeData] = useState<any | null>(null);
  const [countryKey, setCountryKey] = useState<number>(0);

  useEffect(() => {
    if (country) {
      const fetchLeaderInfo = async () => {
        try {
          const response = await axios.get(`https://open-politics.org/api/v1/countries/leaders/${country}`);
          setLeaderInfo(response.data);
        } catch (error) {
          toast({
            title: "Error",
            description: `Failed to fetch leader info for ${country}. Please try again later.`,
          });
        }
      };
      fetchLeaderInfo();
    }
  }, [country, toast]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCountryClick = async (countryName: string) => {
    setCountry(countryName);
    setIsVisible(true);
    setCountryKey(prevKey => prevKey + 1);
  };

  const handleSearch = (results: any) => {
    setResults(results);
    setIsBrowseMode(false);
    toast({
      title: "Search Completed",
      description: "Your search results are now available.",
    });
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

  const loadGeoJSON = () => {
    if (globeRef.current) {
      globeRef.current.loadGeoJSON();
    }
  };

  const getWindowWidth = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 0;
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="container relative mx-auto px-4 mt-0 min-h-screen max-w-full max-h-full overflow-x-hidden py-2">
        <div className="background"></div>
        <h1 suppressHydrationWarning className="my-0 pt-2 text-3xl text-left ml-8 z-52">{currentTime}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-screen gap-4">
          {/* Left Column: Globe and Search */}
          <div className="col-span-1 flex flex-col">
            <motion.div
              className="flex-1 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-full h-full">
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
              </div>
            </motion.div>
            <motion.div
              className="flex-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Search setResults={handleSearch} setCountry={setCountry} globeRef={globeRef} setSummary={handleSummary} />
            </motion.div>
          </div>
          {/* Center Column: Results */}
          <div className="col-span-1 flex flex-col">
            <motion.div
              className="flex-1 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Results results={results} summary={summary} />
            </motion.div>
          </div>
          {/* Right Column: Country Details */}
          <div className="col-span-1 flex flex-col">
            <motion.div
              className="flex-1 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CountryDetailPanel
                key={countryKey}
                articleContent={articleContent}
                legislativeData={legislativeData}
                economicData={economicData}
                leaderInfo={leaderInfo}
                isVisible={isVisible}
                toggleVisibility={toggleVisibility}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default Desk;
