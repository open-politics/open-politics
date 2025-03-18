import { create } from 'zustand';
import axios from 'axios';
import { CoreContentModel } from '@/lib/content';

// Add a helper function to sanitize ISO date strings
const sanitizeIsoDate = (dateStr: string | null | undefined): string | undefined => {
  if (!dateStr) return undefined;
  
  // Replace space before timezone with '%2B' (URL-encoded '+')
  if (dateStr.includes(' ') && dateStr.split(':').length >= 2) {
    const parts = dateStr.split(' ');
    if (parts.length === 2 && parts[1].includes(':')) {
      return `${parts[0]}%2B${parts[1]}`;  // Use URL-encoded '+' directly
    }
  }
  
  // Ensure Z is properly handled
  if (dateStr.endsWith('Z')) {
    return dateStr;
  }
  
  // If no timezone info, assume UTC
  if (dateStr.includes('T') && 
      !dateStr.includes('+') && 
      !dateStr.includes('-') && 
      !dateStr.endsWith('Z')) {
    if (dateStr.split(':').length === 2) {
      return `${dateStr}:00%2B00:00`;  // Use URL-encoded '+' 
    } else if (dateStr.split(':').length === 3) {
      return `${dateStr}%2B00:00`;  // Use URL-encoded '+'
    }
  }
  
  // Ensure any existing '+' is properly URL encoded
  if (dateStr.includes('+')) {
    return dateStr.replace(/\+/g, '%2B');  // Replace all '+' with '%2B'
  }
  
  return dateStr;
};

type GeoDataState = {
  // GeoJSON data
  geojsonData: any | null;
  eventGeojsonData: any | null;
  isLoading: boolean;
  error: Error | null;
  selectedLocation: string | null;
  selectedEventType: string | null;
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  
  // Active content related to current selected features
  activeContents: CoreContentModel[];
  activeContentLoading: boolean;
  activeContentError: Error | null;
  selectedContentId: string | null;
  
  // Actions
  fetchBaselineGeoJson: (limit?: number) => Promise<any | null>;
  fetchEventGeoJson: (eventType: string, startDate?: string, endDate?: string, limit?: number) => Promise<any | null>;
  setSelectedLocation: (locationName: string | null) => void;
  setSelectedEventType: (eventType: string | null) => void;
  setDateRange: (startDate: string | null, endDate: string | null) => void;
  fetchContentsByLocation: (locationName: string) => Promise<CoreContentModel[]>;
  fetchContentById: (contentId: string) => Promise<CoreContentModel | null>;
  setSelectedContentId: (contentId: string | null) => void;
  clearContents: () => void;
};

export const useGeoDataStore = create<GeoDataState>((set, get) => ({
  // Initial state
  geojsonData: null,
  eventGeojsonData: null,
  isLoading: false,
  error: null,
  selectedLocation: null,
  selectedEventType: null,
  dateRange: {
    startDate: null,
    endDate: null,
  },
  activeContents: [],
  activeContentLoading: false,
  activeContentError: null,
  selectedContentId: null,
  
  // Actions for GeoJSON data
  fetchBaselineGeoJson: async (limit = 100) => {
    set({ isLoading: true, error: null });
    try {
      const params: any = { limit };
      const { startDate, endDate } = get().dateRange;
      
      // Sanitize dates before sending to API
      if (startDate) params.start_date = sanitizeIsoDate(startDate);
      if (endDate) params.end_date = sanitizeIsoDate(endDate);
      
      const response = await axios.get('/api/v2/geo/geojson', { params });
      set({ geojsonData: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error fetching baseline GeoJSON:', error);
      set({ error: error as Error, isLoading: false });
      return null;
    }
  },
  
  fetchEventGeoJson: async (eventType, startDate = undefined, endDate = undefined, limit = 100) => {
    set({ isLoading: true, error: null });
    try {
      const params: any = {
        event_type: eventType,
        limit
      };
      
      // Sanitize dates before sending to API
      if (startDate) params.start_date = sanitizeIsoDate(startDate);
      if (endDate) params.end_date = sanitizeIsoDate(endDate);
      
      const response = await axios.get('/api/v2/geo/geojson_events', { params });
      set({ 
        eventGeojsonData: response.data, 
        isLoading: false, 
        selectedEventType: eventType 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching event GeoJSON:', error);
      set({ error: error as Error, isLoading: false });
      return null;
    }
  },
  
  setSelectedLocation: (locationName) => {
    set({ selectedLocation: locationName });
    
    // If there's a location selected, fetch its contents
    if (locationName) {
      get().fetchContentsByLocation(locationName);
    }
  },
  
  setSelectedEventType: (eventType) => {
    set({ selectedEventType: eventType });
  },
  
  setDateRange: (startDate, endDate) => {
    set({ dateRange: { startDate, endDate } });
  },
  
  // Actions for article/content data
  fetchContentsByLocation: async (locationName) => {
    set({ activeContentLoading: true, activeContentError: null });
    try {
      // Encode the location name to handle special characters
      const encodedLocationName = encodeURIComponent(locationName);
      
      try {
        // First try the basic search endpoint
        const response = await axios.get('/api/v2/articles/basic', {
          params: { query: locationName }
        });
        set({ 
          activeContents: response.data.contents, 
          activeContentLoading: false 
        });
        return response.data.contents;
      } catch (basicSearchError) {
        console.warn(`Basic search failed for location ${locationName}, trying entity search:`, basicSearchError);
        
        // If basic search fails, try the entity search as fallback
        const entityResponse = await axios.get('/api/v2/articles/by_entity', {
          params: { entity: encodedLocationName }
        });
        
        set({ 
          activeContents: entityResponse.data.contents || [], 
          activeContentLoading: false 
        });
        return entityResponse.data.contents || [];
      }
    } catch (error) {
      console.error(`Error fetching contents for location ${locationName}:`, error);
      set({ 
        activeContentError: error as Error, 
        activeContentLoading: false,
        activeContents: [] // Clear contents on error to avoid showing stale data
      });
      return [];
    }
  },
  
  fetchContentById: async (contentId) => {
    try {
      const response = await axios.get(`/api/v2/articles/by_id`, {
        params: { id: contentId }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching content with ID ${contentId}:`, error);
      return null;
    }
  },
  
  setSelectedContentId: (contentId) => {
    set({ selectedContentId: contentId });
  },
  
  clearContents: () => {
    set({ activeContents: [], selectedContentId: null });
  }
}));