'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotebookText, ChevronRight, ChevronDown } from 'lucide-react';
import { docsLinks } from "@/data/docLinks";

const DocsSidebar = () => {
  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-16 bg-opacity-75 left-4 z-40 xl:hidden">
            <NotebookText className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside id="desktop-sidebar" className="hidden xl:block w-96 sticky top-0 left-2 h-screen overflow-y-auto">
        <div className="pl-8 pr-4">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
};

const SidebarContent = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 py-6 border-b">
        <Link href="/documentation" className="text-lg relative hover:underline">Documentation</Link>
      </div>
      <ScrollArea className="flex-grow">  
        <nav className="py-2">
          <div className="space-y-1">
            {docsLinks
              .filter(doc => !doc.isTimeline)
              .map((doc) => (
                doc.isPublished && (
                  <div key={doc.href}>
                    <Link href={doc.href} className="block py-2 px-3 rounded-md  transition-colors hover:text-blue-500">
                      {doc.label}
                    </Link>
                    {doc.topics && (
                      <div className="ml-4">
                        {doc.topics.map((topic) => (
                          topic.isPublished && (
                            <div key={topic.href}>
                              <Link href={topic.href} className="block py-1 px-3 rounded-md  transition-colors hover:text-blue-500">
                                {topic.label}
                              </Link>
                              {topic.subtopics && (
                                <div className="ml-4">
                                  {topic.subtopics.map((subtopic) => (
                                    subtopic.isPublished && (
                                      <Link key={subtopic.href} href={subtopic.href} className="block py-1 px-3 rounded-md  transition-colors hover:text-blue-500">
                                        {subtopic.label}
                                      </Link>
                                    )
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                )
              ))}
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
};

export default DocsSidebar;