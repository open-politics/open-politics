import React from 'react';
import LeaderInfo from './LeaderInfo';
import { cn } from "@/lib/utils";

interface WikipediaViewProps {
  content: string;
  leaderInfo: {
    state: string;
    headOfState: string;
    headOfStateImage: string | null;
    headOfGovernment: string;
    headOfGovernmentImage: string | null;
  } | null;
}

const WikipediaView: React.FC<WikipediaViewProps> = ({ content }) => {
  return (
    <div id="articleWindow" className={cn("md:w-2/3 w-full h-80 md:max-h-128 rounded-lg p-4 shadow-sm overflow-hidden")}>
      <div className={cn("inner-content h-full overflow-auto")}>
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
