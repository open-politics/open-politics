'use client'
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { ThemeProvider } from './layout';
import { Button } from '@/components/ui/button';
import Search from '../components/Search';
import WikipediaView from '@/components/WikipediaView';
import LeaderInfo from '../components/LeaderInfo';
import Results from '../components/Results';
import { IssueAreas } from '../components/IssueAreas';
import { OpenAPI } from 'src/client';
import CountryDetailPanel from '../components/CountryDetailPanel';

const Globe = dynamic(() => import('../components/Globe'), { ssr: false });

OpenAPI.BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
OpenAPI.TOKEN = async () => {
  return localStorage.getItem("access_token") || ""
}

const HomePage: React.FC = () => {
  const geojsonUrl = 'http://dev.open-politics.org/api/v1/countries/geojson/';
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
  const [isVisible, setIsVisible] = useState(false); // Added state for visibility
  const [windowWidth, setWindowWidth] = useState<number>(0); // Added state for window width

  const { toast } = useToast();

  useEffect(() => {
    if (country) {
      const fetchLeaderInfo = async () => {
        try {
          console.log(`Fetching leader info for country: ${country}`);
          const response = await axios.get(`http://dev.open-politics.org/api/v1/countries/leaders/${country}`);
          console.log('Leader info response:', response.data);
          setLeaderInfo(response.data);
        } catch (error) {
          console.error('Error fetching leader info:', error);
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
  };

  const handleSearch = (results: any) => {
    setResults(results);
    setIsBrowseMode(false);
    toast({
      title: "Search Completed",
      description: "Your search results are now available.",
    });
  };

  const handleSummary = (summary: string) => {
    setSummary(summary);
  }

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
      <div className="container relative mx-auto px-4 mt-0 min-h-screen max-w-full max-h-full overflow-x-hidden">
        <div className="background"></div> {/* Background div */}
        <h1 suppressHydrationWarning className="my-0 pt-2 text-3xl text-left ml-8">{currentTime}</h1>

        {/* Globe */}
        <motion.div
          id="globe-container"
          className="relative"
          initial={{ top: '10%', left: '50%', transform: 'translateX(-50%)' }}
          animate={getWindowWidth() > 768 ? {
            // desktop view
            opacity: 1,
            top: isBrowseMode ? '50%' : '40%',
            left: isBrowseMode ? '50%' : '40%',
            transform: 'translate(-50%, -50%)',
            position: 'absolute',
            height: isBrowseMode ? '1000px' : '200px',
            width: isBrowseMode ? '100%' : '100%'
          } : {
            // mobile view
            opacity: 1,
            top: isBrowseMode ? '55%' : '40%',
            left: isBrowseMode ? '50%' : '40%',
            transform: 'translate(-50%, -50%)',
            position: 'absolute',
            height: isBrowseMode ? '1000px' : '200px',
            width: isBrowseMode ? '100%' : '100%'
          }}
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
          />
        </motion.div>
        
        {/* Search */}
        <motion.div
          className="absolute w-full"
          initial={{ top: 'calc(50% + 250px)', left: '50%', transform: 'translate(-50%, 0)' }}
          animate={getWindowWidth() > 768 ? {
            // desktop view
            top: isBrowseMode ? 'calc(100% - 200px)' : '50%',
            left: isBrowseMode ? 'calc(50% + 1/6 * 100%)' : 'calc(50% + 1/6 * 100%)',
            transform: 'translate(-50%, -50%)', // Centers both horizontally and vertically
            height: isBrowseMode ? '700px' : '50px', // Adjust height based on mode
            width: isBrowseMode ? '100%' : '100%' // Adjust width based on mode
          } : {
            // mobile view
            top: isBrowseMode ? 'calc(100%)' : '50%',
            left: isBrowseMode ? '50%' : '50%',
            transform: 'translate(-50%, -50%)', // Centers both horizontally and vertically
            height: isBrowseMode ? '700px' : '50px', // Adjust height based on mode
            width: isBrowseMode ? '100%' : '100%' // Adjust width based on mode
          }}
          transition={{ duration: 0.5 }}
        >
          <Search setResults={handleSearch} setCountry={setCountry} globeRef={globeRef} setSummary={handleSummary} />
        </motion.div>

        {/* Results */}
        <motion.div
          className="absolute w-full"
          initial={{ display: 'none' }}
          animate={getWindowWidth() > 768 ? {
            // desktop view
            top: isBrowseMode ? 'calc(50% + 300px)' : 'calc(50% + 200px)',
            left: isBrowseMode ? 'calc(50% + 1/6 * 100%)' : 'calc(50% + 1/6 * 100%)',
            transform: isBrowseMode ? 'translate(-50%, 0)' : 'translate(-50%, 0)',
            height: isBrowseMode ? '0px' : '100%',
            width: isBrowseMode ? '100%' : '100%',
            display: isBrowseMode ? 'none' : 'block',
          } : {
            // mobile view
            position: 'absolute',
            top: isBrowseMode ? '0px' : 'calc(100% - 200px)',
            left: isBrowseMode ? '50%' : '50%',
            transform: isBrowseMode ? 'translate(-50%, 0)' : 'translate(-50%, 0)',
            height: isBrowseMode ? '0px' : '100%',
            width: isBrowseMode ? '100%' : '100%',
            display: isBrowseMode ? 'none' : 'block',
          }}
          transition={{ duration: 0.5 }}
        >
          <Results results={results} summary={summary} />
        </motion.div>

         {/* Country detail panel */}
         <motion.div
          className="relative"
          initial={{ display: 'none' }}
          animate={getWindowWidth() > 768 ? {
            // desktop view
            bottom: isVisible ? '0' : 'auto',
            top: isVisible ? 'auto' : 'calc(100vh - 200px)',
            left: '50%',
            transform: 'translate(-50%, 0)',
            height: '100%',
            width: '100%',
            display: 'block',
          } : {
            // mobile view
            bottom: isVisible ? '0' : 'auto',
            top: isVisible ? 'auto' : 'calc(0vh)',
            left: '50%',
            transform: 'translate(-50%, 0)',
            height: '100%',
            width: '100%',
            display: 'block',
          }}
          transition={{ duration: 0.5 }}
        >
          <CountryDetailPanel
            articleContent={articleContent}
            legislativeData={legislativeData}
            economicData={economicData}
            leaderInfo={leaderInfo}
            isVisible={isVisible}
            toggleVisibility={toggleVisibility}
          />
        {windowWidth < 768 && (
          <Button onClick={toggleVisibility} className="relative left-1/2 transform -translate-x-1/2 px-4 py-2 z-50">
            {isVisible ? 'Hide Details' : 'Show Details'}
          </Button>
        )}
        </motion.div>

        {/* Toggle button */}
        <Button onClick={toggleMode} className="absolute bottom-24 right-0 transform -translate-x-1/2 px-4 py-2 z-50">
          {isBrowseMode ? 'Show Detail View' : 'Show Browse View'}
        </Button>
      </div>
    </ThemeProvider>
  );
};

export default HomePage;