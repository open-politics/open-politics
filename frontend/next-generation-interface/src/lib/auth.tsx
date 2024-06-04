"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuth from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, resetError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    resetError();
    const token = localStorage.getItem('access_token');
    if (token) {
      router.push('/'); // Redirect if already logged in
    }
  }, [resetError, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
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
            {error && <p className="text-red-500">{error}</p>}
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
