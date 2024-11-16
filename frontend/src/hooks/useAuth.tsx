import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LoginService, UsersService } from '../client/services';
import type { Body_login_login_access_token as AccessToken, ApiError } from '../client';

type User = {
  email: string;
  id: number;
  is_active: boolean;
  is_superuser: boolean;
  full_name?: string;
};

const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return null;
      return UsersService.readUserMe();
    },
    retry: false,
    staleTime: 60000, // Increased stale time to 1 minute
    cacheTime: 300000, // Cache time set to 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (data: AccessToken) => {
      const response = await LoginService.loginAccessToken({ formData: data });
      localStorage.setItem('access_token', response.access_token);
      return response;
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/desks/home');
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail || 'Login failed';
      setError(errDetail);
      console.error('Login error:', errDetail);
    },
  });

  const logout = () => {
    localStorage.removeItem('access_token');
    queryClient.invalidateQueries({ queryKey: ['user'] });
    setError(null);
    router.push('/login');
  };

  return {
    user,
    isLoading,
    isLoggedIn: !!user,
    loginMutation,
    logout,
    error,
    resetError: () => setError(null),
  };
};

export default useAuth;