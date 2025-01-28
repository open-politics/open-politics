'use client'
import React, { useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  Layout, 
  Search, 
  Globe, 
  BookOpen, 
  Star,
  Settings,
  LogOut
} from 'lucide-react';

const HomePage = () => {
  const { user, logout, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading || !isLoggedIn) {
    return null;
  }

  const tools = [
    {
      title: 'Political Intelligence Dashboard',
      description: 'Access global political insights and analysis',
      icon: <Layout className="w-6 h-6" />,
      path: '/desk_synthese'
    },
    {
      title: 'Search & Analysis',
      description: 'Search and analyze political content',
      icon: <Search className="w-6 h-6" />,
      path: '/search'
    },
    {
      title: 'Global Overview',
      description: 'Interactive globe with political data',
      icon: <Globe className="w-6 h-6" />,
      path: '/globe'
    },
    {
      title: 'Bookmarked Articles',
      description: 'Access your saved articles',
      icon: <Star className="w-6 h-6" />,
      path: '/bookmarks'
    },
    {
      title: 'Satellite Imagery',
      description: 'Access satellite imagery',
      icon: <Star className="w-6 h-6" />,
      path: '/satellite'
    }
  ];

  return (
    <div className="container mx-auto p-6">
      {/* User Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.full_name || user?.email}
        </h1>
        <p className="text-muted-foreground">
          Your political intelligence dashboard
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {tools.map((tool, index) => (
          <Card 
            key={index}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(tool.path)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {tool.icon}
                {tool.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{tool.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => router.push('/settings')}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
        <Button
          variant="outline"
          onClick={logout}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default HomePage;