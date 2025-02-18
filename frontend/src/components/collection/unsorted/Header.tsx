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
import { Button } from "@/components/ui/button";
import { ModeSwitcher } from "@/components/ui/mode-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarProvider,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar"; // Import Sidebar components
import { NavUser } from '../../ui/nav-user';
import Image from 'next/image';


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
      <div className="w-full mx-auto px-2">
        <div className="flex h-14 items-center justify-between mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1">
            <Image src="/logos/zen45.png" alt="Open Politics Project" width={50} height={50} />
            <span className="text-lg font-semibold text-primary">Open Politics Project</span>
          </Link>

          {/* Navigation Links and Icons */}
          <div className="flex items-center gap-1">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" asChild>
                <Link href="/webpages/about">About</Link>
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
                <PopoverContent className="p-2 w-40 border-none">
                  <div className="flex flex-col space-y-0.5">
                    <a href="https://github.com/open-politics/open-politics" className="flex items-center space-x-1 py-1 hover:bg-secondary/70 rounded-md">
                      <Code />
                      <span>Webapp</span>
                    </a>
                    <a href="https://github.com/open-politics/opol" className="flex items-center space-x-1 py-1 hover:bg-secondary/70 rounded-md">
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
                <SidebarTrigger/>
                <Sidebar collapsible="icon" side="right" variant="floating" className='md:hidden' >
                  <SidebarHeader className="h-16 flex items-center px-4 border-b">
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                          <a href="/desks" className="flex items-center space-x-2">
                            <span className="font-semibold">Open Politics</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarHeader>
                  
                  <SidebarContent className="flex-1 px-4 py-2">
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild className="flex items-center space-x-2 w-full">
                          <a href="/webpages/about">
                            <span>About</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild className="flex items-center space-x-2 w-full">
                          <a href="https://docs.open-politics.org">
                            <span>Documentation</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild className="flex items-center space-x-2 w-full">
                          <a href="mailto:engage@open-politics.org">
                            <span>Contact</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      
                      {isLoggedIn ? (
                        <>
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild className="flex items-center space-x-2 w-full">
                              <a href="/desks/home">
                                <span>Desk</span>
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          {user?.is_superuser && (
                            <SidebarMenuItem>
                              <SidebarMenuButton asChild className="flex items-center space-x-2 w-full">
                                <a href="/admin/users">
                                  <span>Admin</span>
                                </a>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          )}
                          <SidebarMenuItem>
                            <SidebarMenuButton onClick={logout} className="w-full">
                              Logout
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </>
                      ) : (
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild className="flex items-center space-x-2 w-full">
                            <a href="/login">
                              <span>Login</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}
                      
                      <div className="flex items-center justify-between py-4 border-t">
                        <span>Dark Mode</span>
                        <Switch
                          checked={theme === 'dark'}
                          onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        />
                      </div>
                    </SidebarMenu>
                  </SidebarContent>

                  <SidebarFooter className="border-t p-4">
                    {isLoggedIn && (
                      <NavUser user={{
                        name: user.username || 'User',
                        email: user.email || '',
                        avatar: user.avatar || '',
                      }} />
                    )}
                  </SidebarFooter>
                </Sidebar>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;