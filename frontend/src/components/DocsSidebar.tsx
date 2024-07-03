import React from 'react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotebookText } from "lucide-react";

const DocsSidebar = () => {
  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-16 left-4 z-40 md:hidden">
            <NotebookText className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r sticky top-0 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>
    </>
  );
};

const SidebarContent = () => {
  return (
    <div className="flex flex-col h-full ml-2">
      <div className="flex-shrink-0 p-6 border-b">
        <p className="text-lg">Documentation</p>
      </div>
      <ScrollArea className="flex-grow">
        <nav className="p-6">
          <div className="space-y-1">  
            <SidebarItem href="/blog/posts/1" label="Project Overview" />
            <SidebarItem href="/blog/user_guide" label="User Guide" />
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
};

const SidebarItem = ({ href, label }: { href: string; label: string }) => {
  return (
    <Link 
      href={href} 
      className="block py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {label}
    </Link>
  );
};

export default DocsSidebar;
