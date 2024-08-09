import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { LoginService } from '../client';
import type { Body_login_login_access_token as AccessToken, ApiError } from '../client';
import { UsersService } from '../client';
import { useQueryClient } from '@tanstack/react-query';

type UserPublic = {
  email: string
  is_active?: boolean
  is_superuser?: boolean
  full_name?: string | null
  id: number
}

const isLoggedIn = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("access_token") !== null;
  }
  return false;
}

const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: UsersService.readUserMe,
    enabled: isLoggedIn(),
  })

  const login = async (data: AccessToken) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    if (data.grant_type) formData.append('grant_type', data.grant_type);
    if (data.scope) formData.append('scope', data.scope);
    if (data.client_id) formData.append('client_id', data.client_id);
    if (data.client_secret) formData.append('client_secret', data.client_secret);
  
    const response = await LoginService.loginAccessToken({
      formData: formData,
    });
    localStorage.setItem("access_token", response.access_token);
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
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
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
