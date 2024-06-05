"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginService } from 'src/client/services';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/'); // Redirect if already logged in
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      const response = await LoginService.loginAccessToken({ formData });
      localStorage.setItem('token', response.access_token);
      router.push('/');
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrorMessage('Invalid email or password. Please try again.');
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm">Email</label>
              <Input
                className=""
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm">Password</label>
              <Input
                className=""
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
