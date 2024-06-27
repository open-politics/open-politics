import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { loginAccessToken, getCurrentUser } from '../app/auth';
import { LoginService } from '../client';
import type { Body_login_login_access_token as AccessToken, ApiError } from '../client';
import { UsersService } from '../client';


const isLoggedIn = () => {
  return typeof window !== 'undefined' && localStorage.getItem('access_token') !== null;
};

export const logout = () => {
  localStorage.removeItem('access_token');
  console.log('User logged out');
};

export const handleLogout = () => {
  logout();
};

const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { data: user, isLoading } = useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: UsersService.readUserMe,
    enabled: isLoggedIn(),
  });

  const login = async (data: AccessToken) => {
    try {
      const response = await LoginService.loginAccessToken({
        formData: data,
      });
      localStorage.setItem("access_token", response.access_token);
      console.log('Access token set in localStorage:', localStorage.getItem('access_token'));
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      console.log('Login successful');
      router.push('/');
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
    console.log('Access token removed from localStorage:', localStorage.getItem('access_token'));
    router.push('/login');
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
