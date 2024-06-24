'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useAuth, { isLoggedIn } from "@/hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { loginMutation, error, resetError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    resetError();

    try {
      await loginMutation.mutateAsync({ username: email, password });
      router.push('/desk');
    } catch {
      // error is handled by useAuth hook
      setErrorMessage('Invalid email or password. Please try again.');
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
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full p-2 border border-gray-300 rounded"
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
}