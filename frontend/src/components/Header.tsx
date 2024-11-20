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
import { ModeSwitcher } from "@/components/ui/mode-switcher"

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
    <nav className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full">
        <div className="flex h-14 items-center justify-between mx-auto px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span>Open Politics Project</span>
          </Link>

          {/* Navigation Links and Icons */}
          <div className="flex items-center gap-1">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" asChild>
                <Link href="/blog/about">About</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="https://docs.open-politics.org">Documentation</Link>
              </Button>
              <Button variant="ghost" asChild>
                <a href="mailto:engage@open-politics.org">Contact</a>
              </Button>
              
              {/* GitHub Links */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 px-0">
                    <FaGithub />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40">
                  <div className="flex flex-col space-y-2">
                    <a href="https://github.com/open-politics/open-politics" className="flex items-center space-x-2 py-2 px-3 rounded-md">
                      <Code />
                      <span>Webapp</span>
                    </a>
                    <a href="https://github.com/open-politics/ssare" className="flex items-center space-x-2 py-2 px-3 rounded-md">
                      <Database />
                      <span>Data Engine</span>
                    </a>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Auth Navigation */}
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" asChild>
                    <Link href="/desks/home">Desk</Link>
                  </Button>
                  {user?.is_superuser && (
                    <Button variant="ghost" asChild>
                      <Link href="/admin/users">Admin</Link>
                    </Button>
                  )}
                  <Button variant="ghost" onClick={logout}>Logout</Button>
                </div>
              ) : (
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              )}

              <ModeSwitcher />
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <nav className="flex flex-col space-y-4">
                    <Button variant="ghost" asChild>
                      <Link href="/blog/about">About</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="https://docs.open-politics.org">Documentation</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <a href="mailto:engage@open-politics.org">Contact</a>
                    </Button>
                    
                    {isLoggedIn ? (
                      <>
                        <Button variant="ghost" asChild>
                          <Link href="/desks/home">Desk</Link>
                        </Button>
                        {user?.is_superuser && (
                          <Button variant="ghost" asChild>
                            <Link href="/admin/users">Admin</Link>
                          </Button>
                        )}
                        <Button variant="ghost" onClick={logout}>Logout</Button>
                        <Button variant="ghost" asChild>
                          <Link href="/home">Home</Link>
                        </Button>
                      </>
                    ) : (
                      <Button variant="default" asChild>
                        <Link href="/login">Login</Link>
                      </Button>
                    )}

                    <div className="flex items-center justify-between py-4 border-t">
                      <span>Dark Mode</span>
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
      </div>
    </nav>
  );
};

export default Header;
