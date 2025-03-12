'use client'

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/collection/unsorted/AppSidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import LottiePlaceholder from "@/components/ui/lottie-placeholder"
import useAuth from "@/hooks/useAuth"
import { useWorkspaceStore } from "@/zustand_stores/storeWorkspace"
import { useClassificationSettingsStore } from "@/zustand_stores/storeClassificationSettings"
import { Button } from "@/components/ui/button"
import { BrainCircuit } from "lucide-react"
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSchemes } from '@/hooks/useSchemes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function DefaultSchemeSelector() {
  const { activeWorkspace } = useWorkspaceStore();
  const { schemes, loadSchemes } = useSchemes();
  const { getDefaultSchemeId, setDefaultSchemeId } = useClassificationSettingsStore();
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!activeWorkspace?.uid) return;
    
    const workspaceId = typeof activeWorkspace.uid === 'string' 
      ? parseInt(activeWorkspace.uid) 
      : activeWorkspace.uid;
    
    loadSchemes(workspaceId);
    
    if (schemes.length > 0) {
      const defaultId = getDefaultSchemeId(workspaceId, schemes);
      if (defaultId) {
        setSelectedSchemeId(defaultId.toString());
      }
    }
  }, [activeWorkspace?.uid, schemes.length, loadSchemes, getDefaultSchemeId]);
  
  const handleSchemeChange = (value: string) => {
    if (!activeWorkspace?.uid) return;
    
    const workspaceId = typeof activeWorkspace.uid === 'string' 
      ? parseInt(activeWorkspace.uid) 
      : activeWorkspace.uid;
    
    setSelectedSchemeId(value);
    setDefaultSchemeId(workspaceId, parseInt(value));
  };
  
  if (!activeWorkspace?.uid || schemes.length === 0) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <BrainCircuit className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Default Scheme:</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Set the default classification scheme used when clicking the Tag icon</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Select
        value={selectedSchemeId || ''}
        onValueChange={handleSchemeChange}
      >
        <SelectTrigger className="h-8 w-[180px] text-xs">
          <SelectValue placeholder="Select default scheme" />
        </SelectTrigger>
        <SelectContent>
          {schemes.map((scheme) => (
            <SelectItem key={scheme.id} value={scheme.id.toString()}>
              {scheme.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function DesksLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();  
  const activeWorkspace = useWorkspaceStore.getState().activeWorkspace;

  if (typeof window === 'undefined' || isLoading) {
    return <LottiePlaceholder />
  }

  return (
    <div className="h-full max-h-screen flex flex-col md:flex-row overflow-hidden">
      <SidebarProvider>
        <AppSidebar className="fixed md:relative h-full md:h-auto" />
        <SidebarInset className="flex-1 flex flex-col pt-16">
          <header className="flex h-12 shrink-0 items-center gap-2 px-4">
            <div className="flex items-center gap-2">
              <Breadcrumb className="pr-6 md:pr-2">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">
                      <SidebarTrigger className="size-4" />
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex-1 flex justify-end gap-2 h-10">
              <DefaultSchemeSelector />
              <Button variant="outline" size="icon">
                <BrainCircuit className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main>
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}