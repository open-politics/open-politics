'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotebookText } from "lucide-react";
import { docsLinks, DocLink, DocTopic, DocSubtopic } from "@/data/docLinks";
import { ChevronRight, ChevronDown } from 'lucide-react';

const DocsSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sidebar = document.getElementById('desktop-sidebar');
      if (sidebar) {
        const rect = sidebar.getBoundingClientRect();
        setIsCollapsed(rect.top < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-16 left-4 z-40 xl:hidden">
            <NotebookText className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside id="desktop-sidebar" className="hidden xl:block w-64 sticky top-0 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Collapsed Desktop Sidebar */}
      {isCollapsed && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="fixed top-16 left-4 z-40 hidden xl:flex">
              <NotebookText className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

const SidebarContent = () => {
  return (
    <div className="flex flex-col h-full ml-2">
      <div className="flex-shrink-0 p-6 border-b">
        <Link href="/documentation" className="text-lg">Documentation</Link>
      </div>
      <ScrollArea className="flex-grow">
        <nav className="p-6">
          <div className="space-y-1">  
            {docsLinks.filter(link => link.isPublished).map((link: DocLink) => (
              <SidebarItem key={link.href} item={link} level={0} />
            ))}
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
};

const SidebarItem = ({ item, level }: { item: DocLink | DocTopic | DocSubtopic; level: number }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasChildren = 'topics' in item || 'subtopics' in item;

  return (
    <div>
      <div className={`flex items-center py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${level > 0 ? `ml-${level * 4}` : ''}`}>
        {hasChildren && (
          <button onClick={() => setIsOpen(!isOpen)} className="mr-2">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
        <Link href={item.href} className="flex-grow">
          {item.label}
        </Link>
      </div>
      {isOpen && 'topics' in item && item.topics && (
        <div className="ml-4">
          {item.topics.filter(topic => topic.isPublished).map((topic: DocTopic) => (
            <SidebarItem key={topic.href} item={topic} level={level + 1} />
          ))}
        </div>
      )}
      {isOpen && 'subtopics' in item && item.subtopics && (
        <div className="ml-4">
          {item.subtopics.filter(subtopic => subtopic.isPublished).map((subtopic: DocSubtopic) => (
            <SidebarItem key={subtopic.href} item={subtopic} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DocsSidebar;

