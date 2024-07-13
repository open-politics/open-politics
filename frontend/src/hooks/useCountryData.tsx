import { useState, useEffect } from 'react';
import axios from 'axios';

interface CountryData {
  legislativeData: any[];
  economicData: any[];
}

export function useCountryData(countryName: string | null) {
    const [data, setData] = useState<CountryData>({ legislativeData: null, economicData: null });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<{ legislative: Error | null; economic: Error | null }>({
      legislative: null,
      economic: null,
    });
  
    useEffect(() => {
      let isMounted = true;
  
      const fetchData = async () => {
        if (!countryName) {
          setIsLoading(false);
          return;
        }
  
        setIsLoading(true);
        setError({ legislative: null, economic: null });
  
        try {
          const legislativeResponse = await axios.get(`https://open-politics.org/api/v1/countries/legislation/${countryName}`);
          if (isMounted) {
            setData(prev => ({ ...prev, legislativeData: legislativeResponse.data }));
          }
        } catch (err) {
          if (isMounted) {
            setError(prev => ({ ...prev, legislative: err instanceof Error ? err : new Error('An error occurred fetching legislative data') }));
          }
        }
  
        try {
          const economicResponse = await axios.get(`https://open-politics.org/api/v1/countries/econ_data/${countryName}`);
          if (isMounted) {
            setData(prev => ({ ...prev, economicData: economicResponse.data }));
          }
        } catch (err) {
          if (isMounted) {
            setError(prev => ({ ...prev, economic: err instanceof Error ? err : new Error('An error occurred fetching economic data') }));
          }
        }
  
        if (isMounted) {
          setIsLoading(false);
        }
      };
  
      fetchData();
  
      return () => {
        isMounted = false;
      };
    }, [countryName]);
  
    return { data, isLoading, error };
  }