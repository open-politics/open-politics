import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { loginAccessToken, getCurrentUser } from '../app/auth';
import { LoginService } from '../client';
import type { Body_login_login_access_token as AccessToken, ApiError, UserPublic } from '../client';

const isLoggedIn = () => {
  return typeof window !== 'undefined' && localStorage.getItem('access_token') !== null;
};

export const logout = () => {
  localStorage.removeItem('access_token');
};

export const handleLogout = () => {
  logout();
};

const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: user, isLoading } = useQuery<UserPublic | null, Error>({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: isLoggedIn(),
  });

  const login = async (data: AccessToken) => {
    const response = await loginAccessToken({
      formData: data,
    })
    localStorage.setItem("access_token", response.access_token)
  }

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      console.log('Login successful');
      if (isClient) {
        router.push('/');
      }
    },
    onError: (err: ApiError) => {
      let errDetail = (err.body as any)?.detail;

      if (err instanceof AxiosError) {
        errDetail = err.message;
      }

      if (Array.isArray(errDetail)) {
        errDetail = 'Something went wrong';
      }

      setError(errDetail);
      console.error('Login error:', errDetail);
    },
  });

  const logout = () => {
      localStorage.removeItem('access_token');
      if (isClient) {
        router.push('/login');
      }
  };

  return {
    loginMutation,
    logout,
    user,
    isLoading,
    error,
    resetError: () => setError(null),
  };
};

export { isLoggedIn };
export default useAuth;