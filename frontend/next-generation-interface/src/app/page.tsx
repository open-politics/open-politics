'use client';
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

const Globe = dynamic(() => import('../components/Globe'), { ssr: false });

const HomePage: React.FC = () => {
  const geojsonUrl = 'http://dev.open-politics.org/api/v1/countries/geojson/';
  const [results, setResults] = useState(null);
  const [articleContent, setArticleContent] = useState<string>('');
  const [country, setCountry] = useState<string | null>(null);
  const [leaderInfo, setLeaderInfo] = useState<any | null>(null);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleString());
  const [isBrowseMode, setIsBrowseMode] = useState(true);
  const globeRef = useRef<any>(null);
  const [legislativeData, setLegislativeData] = useState([]);
  const [economicData, setEconomicData] = useState([]);

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


  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="container relative mx-auto px-4 mt-0 min-h-screen max-w-full overflow-x-hidden">
        <div className="background"></div> {/* Background div */}
        <h1 className="my-2 pt-8 text-3xl text-left ml-8">{currentTime}</h1>
        <motion.div
          id="globe-container"
          className="absolute w-full"
          initial={{ height: '700px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          animate={isBrowseMode ? (
            getWindowWidth() < 768 ? 
              { height: '200px', top: '15%', left: '50%', transform: 'translate(-50%, -50%)' } :
              { height: '800px', top: '45%', left: '50%', transform: 'translate(-50%, -50%)' }
          ) : (
            getWindowWidth() < 768 ? 
              { height: '50px', top: '7rem', left: '10rem', transform: 'translate(0, -20%)' } :
              { height: '50px', top: '2rem', left: '25rem', transform: 'translate(0, -20%)' }
          )}
          transition={{ duration: 0.5 }}
        >
          <Globe ref={globeRef}
            geojsonUrl={geojsonUrl}
            setArticleContent={setArticleContent}
            onCountryClick={handleCountryClick}
            isBrowseMode={isBrowseMode}
            toggleMode={toggleMode}
            setLegislativeData={setLegislativeData}
            setEconomicData={setEconomicData}
          />
        </motion.div>
        <motion.div
          className="absolute w-full"
          initial={{ top: 'calc(50% + 250px)', left: '50%', transform: 'translate(-50%, 0)' }}
          animate={isBrowseMode ? (
            getWindowWidth() < 768 ? 
              { width: '100%', top: '450px', left: '50%', transform: 'translate(-50%, 0)' } :
              { width: '100%', top: 'calc(50% + 50px)', left: '55%', transform: 'translate(-50%, 0)' }
          ) : (
            getWindowWidth() < 768 ? 
              { width: '100%', top: '200px', left: '50%', transform: 'translate(-50%, 0)' } :
              { width: '2/3', top: '200px', left: '6rem', transform: 'translate(0, 0)' }
          )}
          transition={{ duration: 0.5 }}
        >
          <Search setResults={handleSearch} setCountry={setCountry} globeRef={globeRef} />
        </motion.div>

        <motion.div
          className="absolute w-full"
          initial={{ top: 'calc(50% + 300px)', left: '50%', transform: 'translate(-50%, 0)' }}
          animate={isBrowseMode ? (
            getWindowWidth() < 768 ? { width: 'full', top: 'calc(50% + 100px)', left: '50%', transform: 'translate(-50%, 0)', zIndex: "100" } :
              { width: '100%', top: 'calc(50% + 100px)', left: '50%', transform: 'translate(-50%, 0)' }
          ) : (
            getWindowWidth() < 768 ? { width: '80%', top: '150px', left: '50%', transform: 'translate(-50%, 0)' } :
              { width: '80%', top: '150px', left: '', transform: 'translate(0, 0)' }
          )}
          transition={{ duration: 0.5 }}
        >
          <Results results={results} />
        </motion.div>

        <motion.div
          className="absolute w-full"
          initial={{ top: 'calc(10% + 350px)', left: '50%', transform: 'translate(-50%, 0)' }}
          animate={isBrowseMode ? (
            getWindowWidth() < 768 ? 
              { height: "20%", width: '100%', top: 'calc(20% + 150px)', left: '50%', transform: 'translate(-50%, 0)', zIndex: "-1" } :
              { width: '100%', top: 'calc(20% + 25px)', left: '110%', transform: 'translate(-50%, 0)' }
          ) : (
            getWindowWidth() < 768 ? 
              { width: '80%', top: '200px', left: '50%', transform: 'translate(-50%, 0)' } :
              { width: '80%', top: '200px', left: '50%', transform: 'translate(0, 0)' }
          )}
          transition={{ duration: 0.5 }}
        >
          <WikipediaView content={articleContent} style={{ filter: 'none' }} />
        </motion.div>

        <motion.div
          className="absolute w-full"
          initial={{ top: 'calc(30% + 400px)', left: '50%', transform: 'translate(-50%, 0)' }}
          animate={isBrowseMode ? (
            getWindowWidth() < 768 ? 
              { width: '100%', top: 'calc(30% + 800px)', left: '50%', transform: 'translate(-50%, 0)' } :
              { width: '100%', top: 'calc(24% + 200px)', left: '50%', transform: 'translate(-50%, 0)' }
          ) : (
            getWindowWidth() < 768 ? 
              { width: '80%', top: '650px', left: '50%', transform: 'translate(-50%, 0)' } :
              { width: '80%', top: '500px', left: '20%', transform: 'translate(0, 0)' }
          )}
          transition={{ duration: 0.5 }}
        >
          <IssueAreas legislativeData={legislativeData} economicData={economicData} />
        </motion.div>

        {leaderInfo && (
          <motion.div
            className="absolute w-full"
            initial={{ top: 'calc(50% + 450px)', left: '50%', transform: 'translate(-50%, 0)' }}
            animate={isBrowseMode ? (
              getWindowWidth() < 768 ? 
                { width: '100%', top: 'calc(20% + 200px)', left: '50%', transform: 'translate(-50%, 0)' } :
                { width: '100%', top: 'calc(20% + 20px)', left: 'calc(50% + 32rem)', transform: 'translate(-50%, 0)' }
            ) : (
              getWindowWidth() < 768 ? 
                { width: '80%', top: '300px', left: '50%', transform: 'translate(-50%, 0)' } :
                { width: '80%', top: '180px', left: 'calc(30% + 130px)', transform: 'translate(0, 0)' }
            )}
            transition={{ duration: 0.5 }}
          >
            <LeaderInfo
              state={leaderInfo.State}
              headOfState={leaderInfo['Head of State']}
              headOfStateImage={leaderInfo['Head of State Image']}
              headOfGovernment={leaderInfo['Head of Government']}
              headOfGovernmentImage={leaderInfo['Head of Government Image']}
            />
          </motion.div>
        )}
        
        <Button onClick={toggleMode} className="fixed bottom-4 right-4 px-4 py-2 z-50">
          {isBrowseMode ? 'Show Detail View' : 'Show Browse View'}
        </Button>
      </div>
    </ThemeProvider>
  );
};

export default HomePage;
