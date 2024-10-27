'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useAuth from "@/hooks/useAuth";
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { loginMutation, error, isLoggedIn } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/desk_synthese');
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginMutation.mutateAsync({
        username: email,
        password,
        grant_type: 'password',
        scope: '',
        client_id: '',
        client_secret: '',
      });
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm p-8 space-y-4 bg-transparent bg-opacity-95 backdrop-blur-lg">
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
                className="w-full p-2 border border-gray-300 rounded text-base"
              />
            </div>
            <div>
              <label className="block text-sm">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full p-2 border border-gray-300 rounded text-base pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <Button 
              type="submit" 
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm">
            For an account, please contact us at{' '}
            <a 
              href="mailto:engage@open-politics.org"
              className="text-blue-500 hover:text-blue-600"
            >
              engage@open-politics.org
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
