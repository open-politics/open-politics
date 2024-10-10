import { useState } from 'react';
import axios from 'axios';

const useGeocode = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocodeLocation = async (location: string): Promise<[number, number] | null> => {
    setLoading(true);
    setError(null);
    console.log(`Starting geocode for location: ${location}`); // Added logging
    try {
      const response = await axios.get('/api/v1/locations/get_coordinates/', {
        params: { location, language: 'en' }
      });
      console.log('Response received:', response.data); // Added logging
      const { longitude, latitude } = response.data;
      return [longitude, latitude];
    } catch (err) {
      setError('Failed to geocode location');
      console.error('Geocoding error:', err); // Existing logging
      if (axios.isAxiosError(err)) {
        console.error('Axios error:', err.response?.data);
      }
      return null;
    } finally {
      setLoading(false);
      console.log(`Finished geocode for location: ${location}`); // Added logging
    }
  };

  return { geocodeLocation, loading, error };
};

export default useGeocode;