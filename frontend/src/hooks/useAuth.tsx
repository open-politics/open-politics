import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { LoginService, UsersService } from '../client';
import type { Body_login_login_access_token as AccessToken, ApiError } from '../client';

type UserPublic = {
  email: string;
  is_active?: boolean;
  is_superuser?: boolean;
  full_name?: string | null;
  id: number;
};

const isLoggedIn = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token') !== null;
  }
  return false;
};

const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(isLoggedIn());
  }, []);

  const { data: user, isLoading } = useQuery<UserPublic | null, Error>({
    queryKey: ['currentUser'],
    queryFn: UsersService.readUserMe,
    enabled,
  });

  const login = async (data: AccessToken) => {
    const response = await LoginService.loginAccessToken({
      formData: data,
    });
    localStorage.setItem('access_token', response.access_token);
    setEnabled(true); // Re-enable the query after setting the token
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
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    setEnabled(false); // Disable the query after removing the token
    console.log('Access token removed from localStorage:', localStorage.getItem('access_token'));
    router.push('/login');
  };

  return {
    loginMutation,
    logout,
    user,
    isLoading,
    isLoggedIn: enabled,
    error,
    resetError: () => setError(null),
  };
};

export { isLoggedIn };
export default useAuth;