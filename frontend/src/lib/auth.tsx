import { useState, useEffect, useContext, createContext } from 'react';
import axios from 'axios';

const API_URL = 'http://dev.open-politics.org/api/v1';
const AuthContext = createContext(null);

// Provider in your app component that wraps your app
export function AuthProvider({ children }) {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// Hook for child components to get the auth object and re-render when it changes
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider hook that creates the auth object and handles state
function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initToken = localStorage.getItem('token');
    if (initToken) {
      setToken(initToken);
      getCurrentUser(initToken).then(userData => setUser(userData)).catch(err => setError(err));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/login/access-token`, { email, password });
      localStorage.setItem('token', response.data.access_token);
      setToken(response.data.access_token);
      setUser(await getCurrentUser(response.data.access_token));
      setLoading(false);
      return response.data;
    } catch (error) {
      setError(error);
      setLoading(false);
      throw error;
    }
  };

  const signup = async (email, password, fullName) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/users/open`, { email, password, full_name: fullName });
      setLoading(false);
      return response.data;
    } catch (error) {
      setError(error);
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (userDetails) => {
    try {
      setLoading(true);
      const response = await axios.patch(`${API_URL}/users/me`, userDetails, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      setError(error);
      setLoading(false);
      throw error;
    }
  };

  // Add other authentication-related functions here

  return {
    user,
    token,
    loading,
    error,
    login,
    signup,
    logout,
    updateUser
  };
}
