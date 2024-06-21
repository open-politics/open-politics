import React, { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

interface WikipediaViewProps {
  content: string;
}

const WikipediaView: React.FC<WikipediaViewProps> = ({ content }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const element = e.target as HTMLDivElement;
      if (element.scrollHeight - element.scrollTop === element.clientHeight) {
        window.scrollBy({ top: 50, behavior: 'smooth' });
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div id="articleWindow" className={cn("md:w-2/3 w-full h-80 md:max-h-128 rounded-lg p-4 shadow-sm overflow-hidden")}>
      <div ref={contentRef} className={cn("inner-content h-full overflow-auto")}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
      <style jsx>{`
        .inner-content::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        .inner-content {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default WikipediaView;
