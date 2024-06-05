// app/components/ArticleCard.tsx
import React from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GalleryHorizontal } from 'lucide-react';

type ArticleCardProps = {
  title: string;
  description: string;
  image: string;
  url: string;
};

export function ArticleCard({ title, description, image, url, className, ...props }: ArticleCardProps & React.ComponentProps<typeof Card>) {
  return (
    <Card className={cn("max-h-[175px] text-white rounded-lg mb-2", className)} {...props}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={70} className="overflow-auto">
          <div className="flex-grow">
            <h4 className="m-2 h-8">
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                {title}
              </a>
            </h4>
            <p className="text-xs m-2 text-muted-foreground h-full overflow-auto flex max-h-[150px]">
              {description}
            </p>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel maxSize={50} defaultSize={30} className="max-h-[175px] flex justify-center items-center">
          <GalleryHorizontal />
        </ResizablePanel>
      </ResizablePanelGroup>
    </Card>
  );
}

export default ArticleCard;

  