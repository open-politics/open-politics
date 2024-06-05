// app/new_page.tsx
import { Separator } from "@/components/ui/separator"

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { TabsDemo } from "../../components/IssueAreas";

const ArticleCard: React.FC = () => {
  return ( 
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[200px] max-h-[300px] bg-black text-white max-w-[800px] rounded-lg border"
      >
        <ResizablePanel defaultSize={60}>
          <div className="h-full p-6">
            <div className="font-semibold text-green-500 mb-4">European Politicians are stuck on what to do with wildfires</div>
            <div className="h-full overflow-auto">
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={40}>
          <div className="h-full items-center justify-center p-6">
            <img src="https://source.unsplash.com/random/800x600/?politics" alt="Politics Image" className="object-cover rounded-md" />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
  )
}

export default ArticleCard;
