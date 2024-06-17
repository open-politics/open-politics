// app/components/ArticleCard.tsx
import React from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ArticleCardProps = {
  title: string;
  description: string;
  image: string;
  url: string;
};

export function ArticleCard({ title, description, image, url, className, ...props }: ArticleCardProps & React.ComponentProps<typeof Card>) {
  return (
    <Card className={cn("max-h-[175px] text-white rounded-lg mb-2", className)} {...props}>
                <div className="flex-grow">
            <h4 className="m-2 mb-4 h-8">
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                {title}
              </a>
            </h4>
            <p className="text-xs m-2 text-muted-foreground h-full overflow-auto flex max-h-[150px]">
              {description}
            </p>
          </div>
    </Card>
  );
}

export default ArticleCard;

  