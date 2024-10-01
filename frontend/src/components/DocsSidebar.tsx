'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotebookText, ChevronRight, ChevronDown } from 'lucide-react';

const DocsSidebar = () => {
  const [docsStructure, setDocsStructure] = useState({});
  
  useEffect(() => {
    // Fetch metadata from a single file
    const fetchMetadata = async () => {
      try {
        const metadataResponse = await fetch('/api/v1/editor/metadata/');
        if (metadataResponse.ok) {
          const metadataData = await metadataResponse.json();
          setDocsStructure(metadataData.docs || {});
        } else {
          console.error("Failed to fetch metadata:", metadataResponse.statusText);
          setDocsStructure({});
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
        setDocsStructure({});
      }
    };
  
    fetchMetadata();
  }, []);

  const renameFile = async (oldName, newName) => {
    const response = await fetch('/api/v1/editor/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ old_name: oldName, new_name: newName }),
    });
  
    const data = await response.json();
    alert(data.message);
    // Refetch the structure
    setDocsStructure((prev) =>
      prev.map((file) => (file === oldName ? newName : file))
    );  
  };
  
  const updateMetadata = async (file, newMetadata) => {
    const response = await fetch('/api/v1/editor/metadata/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_name: file, new_metadata: newMetadata }),
    });
  
    const data = await response.json();
    alert(data.message);
    // Refetch metadata
    setMetadata((prev) => ({
      ...prev,
      [file]: newMetadata,
    }));
  };
  

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
          <SidebarContent docsStructure={docsStructure} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside id="desktop-sidebar" className="hidden xl:block w-96 sticky top-0 left-2 h-screen overflow-y-auto">
        <div className="pl-8 pr-4">
          <SidebarContent docsStructure={docsStructure} />
        </div>
      </aside>
    </>
  );
};

const SidebarContent = ({ docsStructure }) => {
  // Add a fallback check for docsStructure being undefined or empty
  if (!docsStructure || Object.keys(docsStructure).length === 0) {
    return <div>No documentation structure available</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 py-6 border-b">
        <Link href="/documentation" className="text-lg relative">Documentation</Link>
      </div>
      <ScrollArea className="flex-grow">
        <nav className="py-2">
          <div className="space-y-1">
            {Object.keys(docsStructure).map((folder) => (
              <FolderItem key={folder} folder={folder} data={docsStructure[folder]} />
            ))}
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
};


const FolderItem = ({ folder, data }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center py-2 px-3 rounded-md text-sm transition-colors">
        <button onClick={() => setIsOpen(!isOpen)} className="mr-2">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <span>{data.title}</span>
      </div>

      {isOpen && (
        <div className="ml-4">
          {data.children.map((item) => (
            <div key={item.file}>
              <Link href={`/docs/${folder}/${item.file.replace('.mdx', '')}`}>
                <span>{item.title}</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocsSidebar;
