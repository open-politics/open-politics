"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { LoginService } from 'src/client';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: 'your email',
      password: 'your password'
    }
  });
  const [errorMessage, setErrorMessage] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/'); // Redirect if already logged in
    }
  }, [router]);

  const onSubmit = async (data: { username: string; password: string }) => {
    setErrorMessage('');
    try {
      const response = await LoginService.loginLoginAccessToken({ 
        formData: {
          ...data,
          grant_type: 'password',
        }
      });
      localStorage.setItem('token', response.access_token);
      router.push('/');
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        setErrorMessage('Invalid username or password. Please try again.');
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
      console.error('Login failed', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-8 space-y-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm">Username</label>
              <Input
                type="text"
                {...register('username', { required: 'Username is required' })}
                className={errors.username ? 'error' : ''}
              />
              {errors.username && <p className="text-red-500">{errors.username.message}</p>}
            </div>
            <div>
              <label className="block text-sm">Password</label>
              <Input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <p className="text-red-500">{errors.password.message}</p>}
            </div>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm">Don't have an account? Sign up</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;