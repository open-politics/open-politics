'use client'
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FaGithub } from "react-icons/fa6";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import useAuth from '@/hooks/useAuth';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Code, Database } from "lucide-react"; 
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { theme, setTheme, systemTheme } = useTheme();
  const { logout, user, isLoggedIn } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Simplified mount handling
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize the current theme
  const currentTheme = useMemo(() => {
    if (!mounted) return null;
    return theme === 'system' ? systemTheme : theme;
  }, [theme, systemTheme, mounted]);

  // Early return for SSR
  if (!mounted) {
    return <nav className="h-16" />; // Placeholder to prevent layout shift
  }

  return (
    <nav className="sticky top-0 z-50 text-gray-900 dark:text-white bg-opacity-20 backdrop-blur-lg h-16">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo - always visible */}
          <Link href="/" className="flex items-center py-4 px-3 text-gray-700 dark:text-white">
            <span className="font-bold">Open Politics Project</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Static Links */}
            <Link href="/blog/about" className="">About</Link>
            <Link href="https://docs.open-politics.org" className="">Documentation</Link>
            <a href="mailto:engage@open-politics.org" className="">Contact</a>
            
            {/* GitHub Links */}
            <Popover>
              <PopoverTrigger asChild>
                <a className="">
                  <FaGithub className="h-6 w-6 mx-auto" />
                </a>
              </PopoverTrigger>
              <PopoverContent className="w-40">
                <div className="flex flex-col space-y-2">
                  <a href="https://github.com/open-politics/open-politics" className="flex items-center space-x-2 py-2 px-3 rounded-md text-sm hover:bg-accent/10 hover:text-accent-foreground">
                    <Code className="h-4 w-4" />
                    <span>Webapp</span>
                  </a>
                  <a href="https://github.com/open-politics/ssare" className="flex items-center space-x-2 py-2 px-3 rounded-md text-sm hover:bg-accent/10 hover:text-accent-foreground">
                    <Database className="h-4 w-4" />
                    <span>Data Engine</span>
                  </a>
                </div>
              </PopoverContent>
            </Popover>

            {/* Auth Navigation */}
            {isLoggedIn ? (
              <>
                <Link href="/desk_synthese" className="">Desk</Link>
                {user?.is_superuser && (
                  <Link href="/admin/users" className="">Admin</Link>
                )}
                <button onClick={logout} className="">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="">Login</Link>
            )}

            {/* Theme Toggle */}
            <div className="flex items-center py-2 px-3 rounded-md text-sm hover:bg-accent/10 hover:text-accent-foreground text-gray-700 dark:text-white">
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              />
              {theme === 'dark' ? <Sun className="ml-2" /> : <Moon className="ml-2" />}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="flex flex-col space-y-4">
                  <Link href="/blog/about" className="">About</Link>
                  <Link href="https://docs.open-politics.org" className="">Documentation</Link>
                  <a href="mailto:engage@open-politics.org" className="">Contact</a>
                  
                  {isLoggedIn ? (
                    <>
                      <Link href="/desk_synthese" className="">Desk</Link>
                      {user?.is_superuser && (
                        <Link href="/admin/users" className="">Admin</Link>
                      )}
                      <button onClick={logout} className="">
                        Logout 
                      </button>
                    </>
                  ) : (
                    <Link href="/login" className="">Login</Link>
                  )}

                  <div className="flex items-center justify-between py-4 border-t">
                    <span className="text-sm font-medium">Dark Mode</span>
                    <Switch
                      checked={theme === 'dark'}
                      onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <div className="w-4/5 h-px mt-0 bg-black dark:bg-white mx-auto" />
    </nav>
  );
};

export default Header;
