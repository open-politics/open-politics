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

const WikipediaView: React.FC<WikipediaViewProps> = ({ content, leaderInfo }) => {
  return (
    <div id="articleWindow" className={cn("leader-info fixed w-[450px] h-[200px] bg-black bg-opacity-30 backdrop backdrop-blur-xl rounded-lg p-4 shadow-sm overflow-hidden")}>
      {leaderInfo && (
        <LeaderInfo 
          state={leaderInfo.state}
          headOfState={leaderInfo.headOfState}
          headOfStateImage={leaderInfo.headOfStateImage}
          headOfGovernment={leaderInfo.headOfGovernment}
          headOfGovernmentImage={leaderInfo.headOfGovernmentImage}
        />
      )}
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
