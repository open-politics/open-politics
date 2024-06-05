import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { login as loginService, getCurrentUser, logout as logoutService } from '@/lib/auth';

const isLoggedIn = () => {
  return localStorage.getItem('access_token') !== null;
};

const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      getCurrentUser()
        .then(setUser)
        .catch(() => {
          setError('Failed to fetch user');
          logout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await loginService(email, password);
      setUser(data.user);
      setError(null);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  const logout = () => {
    logoutService();
    setUser(null);
    router.push('/login');
  };

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    resetError: () => setError(null),
  };
};

export { isLoggedIn };
export default useAuth;
