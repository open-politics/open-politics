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

const Globe = dynamic(() => import('@/components/Globe'), { ssr: false });

OpenAPI.BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
OpenAPI.TOKEN = async () => {
  return localStorage.getItem("access_token") || ""
}

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
      <div className="container relative mx-auto px-4 mt-0 min-h-screen max-w-full max-h-full overflow-x-hidde py-2">
        <div className="background"></div>
        <h1 suppressHydrationWarning className="my-0 pt-2 text-3xl text-left ml-8 z-52">{currentTime}</h1>

        <motion.div
          id="globe-container"
          className="relative"
          initial={{ top: '10%', left: '50%', transform: 'translateX(-50%)' }}
          animate={getWindowWidth() > 768 ? {
            // Desktop
            opacity: 1,
            top: isBrowseMode ? '50%' : '0%',
            left: isBrowseMode ? '50%' : '50%',
            transform: 'translate(-50%, -50%)',
            position: 'absolute',
            height: isBrowseMode ? '100%' : '-10%',
            width: isBrowseMode ? '100%' : '100%',
            zIndex: isBrowseMode ? 0 : 0,
          } : {
            opacity: 1,
            top: isBrowseMode ? '50%' : '10%',
            left: isBrowseMode ? '50%' : '50%',
            transform: 'translate(-50%, -50%)',
            position: 'absolute',
            height: isBrowseMode ? '100%' : '50%',
            width: isBrowseMode ? '100%' : '30%'
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
            onCountryZoom={handleCountryZoom}
          />
        </motion.div>

        <motion.div
          className="absolute"
          initial={{ top: 'calc(50% + 250px)', left: '50%', transform: 'translate(-50%, 0)' }}
          animate={getWindowWidth() > 768 ? {
            top: isBrowseMode ? 'calc(100% - 100px)' : 'calc(30%)',
            left: isBrowseMode ? 'calc(50%)' : 'calc(50%)',
            transform: 'translate(-50%, -50%)',
            height: isBrowseMode ? '700px' : '50px',
            width: isBrowseMode ? '50%' : '50%'
          } : {
            top: isBrowseMode ? 'calc(110%)' : 'calc(35%)',
            left: isBrowseMode ? '50%' : '50%',
            transform: 'translate(-50%, -50%)',
            height: isBrowseMode ? '700px' : '50px',
            width: isBrowseMode ? '100%' : '100%'
          }}
          transition={{ duration: 0.5 }}
        >
          <Search setResults={handleSearch} setCountry={setCountry} globeRef={globeRef} setSummary={handleSummary} />
        </motion.div>

        <motion.div
          className="absolute w-full"
          initial={{ display: 'none' }}
          animate={getWindowWidth() > 768 ? {
            top: isBrowseMode ? 'calc(50% + 300px)' : 'calc(50%)',
            left: isBrowseMode ? 'calc(50%)' : 'calc(50%)',
            transform: isBrowseMode ? 'translate(-50%, 0)' : 'translate(-50%, 0)',
            height: isBrowseMode ? '0px' : '100%',
            width: isBrowseMode ? '50%' : '50%',
            display: isBrowseMode ? 'none' : 'block',
          } : {
            position: 'absolute',
            top: isBrowseMode ? '0px' : 'calc(45%)',
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

        <motion.div
          className={`relative bg-sky-400 dark:bg-[#373737] mt-2 bg-opacity-20 dark:bg-opacity-40 backdrop backdrop-blur-md dark:backdrop-blur-2xl max-w-[800px]
            ${isVisible ? 'z-50' : 'z-10'}
            ${isVisible ? 'rounded-lg' : 'opacity-10'}
          `}
          initial={{ bottom: '0', display: 'block' }}
          animate={getWindowWidth() > 768 ? {
            bottom: isVisible ? '0' : 'auto',
            top: isVisible ? 'auto' : 'calc(100vh - 200px)',
            left: '50%',
            transform: 'translate(-50%, 0)',
            height: '100%',
            width: isBrowseMode ? '100%' : '100%',
            display: isVisible ? 'block' : 'none',
          } : {
            display: isVisible ? 'block' : 'none',
            bottom: isVisible ? '0' : 'auto',
            top: isVisible ? 'auto' : 'calc(0vh)',
            left: '50%',
            transform: 'translate(-50%, 0)',
            height: '100%',
            width: isBrowseMode ? '100%' : '100%',
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
        </motion.div>

        <motion.div
          className="relative"
          initial={{ }}
          animate={getWindowWidth() > 768 ? {
            opacity: isBrowseMode ? 1 : 0.5,
            top: isBrowseMode ? '45%' : '20%',
            left: isBrowseMode ? '50%' : '50%',
            transform: 'translate(-50%, -50%)',
            position: 'absolute',
          } : {
            opacity: isBrowseMode ? 1 : 0.5,
            top: isBrowseMode ? '60%' : '20%',
            left: isBrowseMode ? '50%' : '50%',
            transform: 'translate(-50%, -50%)',   
            position: 'absolute',
          }}
          transition={{ duration: 0.5 }}
        >
          <Button onClick={toggleMode} className="z-50 bg-[#BED4FF] dark:bg-[#D2FFD9]">
            {isBrowseMode ? <FileSearch2 className="" /> : <Map className="" />}
          </Button>
        </motion.div>
      </div>
      {/* <NewsHome prompt="News Home" country_focus={newsHomeData?.country_focus} articles={newsHomeData?.articles} images={newsHomeData?.images} summary={newsHomeData?.summary} topics={newsHomeData?.topics} entities={newsHomeData?.entities} country={newsHomeData?.country} /> */}
      {/* <ExpoTest /> */}
    </ThemeProvider>
  );
};

export default Desk;
