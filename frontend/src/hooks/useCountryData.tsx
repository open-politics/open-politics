import { useState, useEffect } from 'react';
import axios from 'axios';

interface CountryData {
  legislativeData: any[];
  economicData: any[];
}

interface LegislativeItem {
    law: string;
    status: string;
    label: string;
    date: string;
    initiative: string;
    href?: string;
  }

  export function useCountryData(countryName: string | null) {
    const [legislativeData, setLegislativeData] = useState<any[]>([]);
    const [economicData, setEconomicData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState({ legislative: true, economic: true });
    const [error, setError] = useState<{ legislative: Error | null; economic: Error | null }>({
      legislative: null,
      economic: null,
    });
  
    useEffect(() => {
      let isMounted = true;
  
      const fetchLegislativeData = async () => {
        if (!countryName) return;
        
        try {
          const response = await axios.get(`https://open-politics.org/api/v1/countries/legislation/${countryName}`);
          if (isMounted) {
            const mappedData = response.data.map(item => ({
              ...item,
              status: mapLabelToStatus(item.label),
            }));
            setLegislativeData(mappedData);
          }
        } catch (err) {
          if (isMounted) {
            setError(prev => ({ ...prev, legislative: err instanceof Error ? err : new Error('An error occurred fetching legislative data') }));
          }
        } finally {
          if (isMounted) {
            setIsLoading(prev => ({ ...prev, legislative: false }));
          }
        }
      };
  
      const fetchEconomicData = async () => {
        if (!countryName) return;
        
        try {
          const response = await axios.get(`https://open-politics.org/api/v1/countries/econ_data/${countryName}`);
          if (isMounted) {
            setEconomicData(response.data);
          }
        } catch (err) {
          if (isMounted) {
            setError(prev => ({ ...prev, economic: err instanceof Error ? err : new Error('An error occurred fetching economic data') }));
          }
        } finally {
          if (isMounted) {
            setIsLoading(prev => ({ ...prev, economic: false }));
          }
        }
      };
  
      fetchLegislativeData();
      fetchEconomicData();
  
      return () => {
        isMounted = false;
      };
    }, [countryName]);
  
    return { 
      data: { legislativeData, economicData }, 
      isLoading: isLoading.legislative || isLoading.economic,
      error 
    };
  }

function mapLabelToStatus(label: string): string {
  switch (label) {
    case 'red':
      return 'rejected';
    case 'yellow':
      return 'pending';
    case 'green':
      return 'accepted';
    default:
      return 'unknown';
  }
}