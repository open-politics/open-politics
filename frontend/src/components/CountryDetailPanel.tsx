import React, { useState } from 'react';
import WikipediaView from './WikipediaView';
import { IssueAreas } from './IssueAreas';
import LeaderInfo from './LeaderInfo';
import { Button } from '@/components/ui/button';
import { CircleX } from 'lucide-react';
import { ListCollapse } from 'lucide-react';

interface CountryDetailPanelProps {
  articleContent: string;
  legislativeData: any[];
  economicData: any[];
  leaderInfo: {
    state: string;
    headOfState: string;
    headOfStateImage: string | null;
    headOfGovernment: string;
    headOfGovernmentImage: string | null;
  } | null;
  isVisible: boolean;
  toggleVisibility: () => void;
}

const CountryDetailPanel: React.FC<CountryDetailPanelProps> = ({
  articleContent,
  legislativeData,
  economicData,
  leaderInfo,
  isVisible,
  toggleVisibility
}) => {
  return (
    <div className="space-y-4 flex flex-col h-full p-4 items-center bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button onClick={toggleVisibility} className="w-14 h-8 p-2 border-none absolute top-2 right-2">
        {isVisible ? <CircleX size={24} /> : <ListCollapse size={24} />}
      </Button> 
      {isVisible && (
        <>
          {leaderInfo && (
            <LeaderInfo
              state={leaderInfo['State']}
              headOfState={leaderInfo['Head of State']}
              headOfStateImage={leaderInfo['Head of State Image']}
              headOfGovernment={leaderInfo['Head of Government']}
              headOfGovernmentImage={leaderInfo['Head of Government Image']}
            />
          )}
          <WikipediaView content={articleContent} />
          {leaderInfo && (
            <IssueAreas legislativeData={legislativeData} economicData={economicData} />
          )}
        </>
      )}
    </div>
  );
};

export default CountryDetailPanel;