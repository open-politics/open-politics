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
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const queryClient = useQueryClient();
	const { logout, user, isLoading } = useAuth();
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setMounted(true);
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (mounted) {
			const isDarkMode = theme === 'dark';
			localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
		}
	}, [theme, mounted]);

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
		<nav className="sticky top-0 z-50 text-gray-900 dark:text-white">
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
						<Link href="/blog/about" className="py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-gray-700 dark:text-white">About</Link>
						<Link href="/documentation" className="py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-gray-700 dark:text-white">Docs</Link>
						<a href="mailto:engage@open-politics.org" className="py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-gray-700 dark:text-white">Contact</a>
						<a href="https://github.com/JimVincentW/open-politics" className="py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground flex items-center">
							<FaGithub className="h-6 w-6" style={{ margin: '0 auto' }} />
						</a>
						{isClient && (
							<>
								{user ? (
									<>
										<Link href="/desk" className="py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-gray-700 dark:text-white">Desk</Link>
										<button onClick={handleLogout} className="py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-gray-700 dark:text-white">Logout</button>
										{user.is_superuser && (
											<Link href="/admin/users" className="py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-gray-700 dark:text-white">Admin</Link>
										)}
									</>
								) : (
									<Link href="/login" className="py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-gray-700 dark:text-white">Login</Link>
								)}
							</>
						)}
						<div className="flex items-center py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground dark:text-white">
							{mounted && (
								<Switch
									checked={theme === 'dark'}
									onCheckedChange={toggleDarkMode}
								/>
							)}
							{mounted && (theme === 'dark' ? <Sun className="ml-2" /> : <Moon className="ml-2" />)}
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
				<div className="fixed inset-0 z-50">
					<div className="fixed right-0 top-0 h-full w-64 top-0 z-50 w-1/2 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-gray-900 dark:text-whiteoverflow-y-auto">
						<div className="flex justify-end p-4">
							<button onClick={toggleMenu} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
								</svg>
							</button>
						</div>
						<nav className="px-4 pt-4 pb-8">
							<Link href="/blog/about" className="block py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-gray-700 dark:text-white">About</Link>
							<Link href="/documentation" className="block py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-gray-700 dark:text-white">Docs</Link>
							<a href="mailto:engage@open-politics.org" className="block py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-gray-700 dark:text-white">Contact</a>
							<a href="https://github.com/JimVincentW/open-politics" className="flex items-center py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-gray-700 dark:text-white">
								<FaGithub className="h-6 w-6 mr-2" />
							</a>
							{isClient && !isLoading && (
								<>
									{user ? (
										<>
											<Link href="/desk_synthese" className="block py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-gray-700 dark:text-white">Desk</Link>
											<button onClick={handleLogout} className="block w-full text-left py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-gray-700 dark:text-white">Logout</button>
											{user.is_superuser && (
												<Link href="/admin/users" className="block py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-gray-700 dark:text-white">Admin</Link>
											)}
										</>
									) : (
										<Link href="/login" className="block py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground text-gray-700 dark:text-white">Login</Link>
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
					</div>
				</div>
			)}
			<div className="w-4/5 h-px mt-0 bg-black dark:bg-white mx-auto"></div>
		</nav>
	);
};

export default Header;
