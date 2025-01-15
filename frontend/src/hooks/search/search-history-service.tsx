import axios from 'axios';
import type { SearchHistory, SearchHistoriesOut } from '@/lib/types';

const API_BASE_URL = '/api/v1/search_histories/'; // Ensure trailing slash is present

export const SearchHistoriesService = {
  create: async (searchHistory: Omit<SearchHistory, 'id' | 'user_id'>) => {
    const response = await axios.post<SearchHistory>(`${API_BASE_URL}/create`, searchHistory, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  },

  list: async (skip: number = 0, limit: number = 100) => {
    const response = await axios.get<SearchHistoriesOut>(`${API_BASE_URL}/read`, {
      params: { skip, limit },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  },
};