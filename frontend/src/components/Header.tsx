'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaGithub } from "react-icons/fa6";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import useAuth from '@/hooks/useAuth';
import { useQueryClient } from "@tanstack/react-query"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Code, Database } from "lucide-react"; 
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const { logout, user, isLoggedIn } = useAuth();
  const isClient = typeof window !== 'undefined';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      queryClient.setQueryData(["currentUser"], null);
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const toggleDarkMode = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 text-gray-900 dark:text-white bg-opacity-20 backdrop-blur-lg">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4 items-center">
            <div>
              <Link href="/" className="flex items-center py-4 px-3 text-gray-700 dark:text-white">
                <span className="font-bold">Open Politics Project</span>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <Link href="/blog/about" className="py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent/10 hover:text-accent-foreground text-gray-700 dark:text-white">
              About
            </Link>
            <Link href="https://docs.open-politics.org" className="py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent/10 hover:text-accent-foreground text-gray-700 dark:text-white">
              Documentation
            </Link>
            <a href="mailto:engage@open-politics.org" className="py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent/10 hover:text-accent-foreground text-gray-700 dark:text-white">
              Contact
            </a>
            <Popover>
              <PopoverTrigger asChild>
                <a className="py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent/10 hover:text-accent-foreground flex items-center cursor-pointer text-gray-700 dark:text-white">
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
            {mounted && isClient && (
              <>
                {isLoggedIn ? (
                  <>
                    <Link href="/desk_synthese" className="py-2 px-3 rounded-md text-sm hover:bg-accent/10 hover:text-accent-foreground text-gray-700 dark:text-white">
                      Desk
                    </Link>
                    <button onClick={handleLogout} className="py-2 px-3 rounded-md text-sm hover:bg-accent/10 hover:text-accent-foreground text-gray-700 dark:text-white">
                      Logout
                    </button>
                    <Link href="/admin/users" className="py-2 px-3 rounded-md text-sm hover:bg-accent/10 hover:text-accent-foreground text-gray-700 dark:text-white">
                      Admin
                    </Link>
                  </>
                ) : (
                  <Link href="/login" className="py-2 px-3 rounded-md text-sm hover:bg-accent/10 hover:text-accent-foreground text-gray-700 dark:text-white">
                    Login
                  </Link>
                )}
              </>
            )}
            <div className="flex items-center py-2 px-3 rounded-md text-sm hover:bg-accent/10 hover:text-accent-foreground text-gray-700 dark:text-white">
              {mounted && (
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleDarkMode}
                />
              )}
              {mounted && (theme === 'dark' ? <Sun className="ml-2" /> : <Moon className="ml-2" />)}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="mobile-menu-button">
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="px-4 pt-4 pb-8">
                  <Link href="/blog/about" className="block py-2 px-3 rounded-md text-sm hover:bg-accent/10 hover:text-accent-foreground text-gray-700 dark:text-white">
                    About
                  </Link>
                  <Link href="https://docs.open-politics.org" className="block py-2 px-3 rounded-md text-sm hover:bg-accent/10 hover:text-accent-foreground text-gray-700 dark:text-white">
                    Documentation
                  </Link>
                  <a href="mailto:engage@open-politics.org" className="block py-2 px-3 rounded-md text-sm hover:bg-accent/10 hover:text-accent-foreground text-gray-700 dark:text-white">
                    Contact
                  </a>
                  <a href="https://github.com/JimVincentW/open-politics" className="flex items-center py-2 px-3 rounded-md text-sm hover:bg-accent/10 hover:text-accent-foreground text-gray-700 dark:text-white">
                    <FaGithub className="h-6 w-6 mr-2" />
                  </a>
                  {mounted && isClient && (
                    <>
                      {isLoggedIn ? (
                        <>
                          <Link href="/desk_synthese" className="block py-2 px-3 rounded-md text-sm hover:bg-accent/10 hover:text-accent-foreground text-gray-700 dark:text-white">
                            Desk
                          </Link>
                          <button onClick={handleLogout} className="block w-full text-left py-2 px-3 rounded-md text-sm hover:bg-accent/10 hover:text-accent-foreground text-gray-700 dark:text-white">
                            Logout
                          </button>
                          {user?.is_superuser && (
                            <Link href="/admin/users" className="block py-2 px-3 rounded-md text-sm hover:bg-accent/10 hover:text-accent-foreground text-gray-700 dark:text-white">
                              Admin
                            </Link>
                          )}
                        </>
                      ) : (
                        <Link href="/login" className="block py-2 px-3 rounded-md text-sm hover:bg-accent/10 hover:text-accent-foreground text-gray-700 dark:text-white">
                          Login
                        </Link>
                      )}
                    </>
                  )}
                  <div className="flex items-center justify-between py-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-white">Dark Mode</span>
                    {mounted && (
                      <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={toggleDarkMode}
                      />
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <div className="w-4/5 h-px mt-0 bg-black dark:bg-white mx-auto"></div>
    </nav>
  );
};

export default Header;