'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaGithub } from "react-icons/fa6";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import useAuth, { isLoggedIn } from '@/hooks/useAuth';
import { useQueryClient } from "@tanstack/react-query"

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { setTheme } = useTheme();
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const currentUser = typeof window !== 'undefined' ? queryClient.getQueryData<UserPublic>(["currentUser"]) : null;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'enabled';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleLogout = async () => {
    try {
      logout();
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'disabled');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'enabled');
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="text-gray-900 dark:text-white">
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
            <Link href="/blog/about" className="py-5 px-3 text-gray-700 dark:text-white">About</Link>
            <Link href="/blog/user_guide" className="py-5 px-3 text-gray-700 dark:text-white">News</Link>
            <a href="mailto:engage@open-politics.org" className="py-5 px-3 text-gray-700 dark:text-white">Contact</a>
            <a href="https://github.com/JimVincentW/open-politics" className="py-5 px-3 flex items-center">
              <FaGithub className="h-6 w-6" style={{ margin: '0 auto' }} />
            </a>
            {currentUser?.email ? (
              <button onClick={handleLogout} className="text-gray-700 dark:text-white">Logout</button>
            ) : (
              <Link href="/login" className="text-gray-700 dark:text-white">Login</Link>
            )}
            <div className="flex items-center py-5 px-3 dark:text-white">
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              {darkMode ? <Sun className="ml-2" /> : <Moon className="ml-2" />}
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button className="mobile-menu-button" onClick={toggleMenu}>
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu md:hidden z-10 flex flex-column items-center justify-center">
          <Link href="/blog/about" className="block py-2 px-2 text-sm mb-2">About</Link>
          <Link href="/blog/user_guide" className="block py-2 px-2 text-sm mb-2">News</Link>
          <a href="mailto:engage@open-politics.org" className="block py-2 px-2 text-sm mb-2">Contact</a>
          <a href="https://github.com/JimVincentW/open-politics" className="block py-2 px-2 text-sm mb-2 flex items-center">
            <FaGithub className="h-6 w-6" />
          </a>
          {currentUser?.email ? (
            <button onClick={logout} className="text-gray-700 dark:text-white">Logout</button>
          ) : (
            <Link href="/login" className="text-gray-700 dark:text-white">Login</Link>
          )}
          <div className="flex items-center py-4 mb-2 px-3 dark:text-white">
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              {darkMode ? <Sun className="ml-2" /> : <Moon className="ml-2" />}
            </div>
        </div>
      )}
      <div className="w-4/5 h-px mt-0 bg-black dark:bg-white mx-auto"></div>
    </nav>
  );
};

export default Header;