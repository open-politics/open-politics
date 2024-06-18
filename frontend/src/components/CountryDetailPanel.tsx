import React, { useState } from 'react';
import WikipediaView from './WikipediaView';
import { IssueAreas } from './IssueAreas';
import LeaderInfo from './LeaderInfo';
import { Button } from '@/components/ui/button';
import { CircleX } from 'lucide-react';

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
    <div className="country-detail-panel space-y-4 flex flex-col max-h-5/6 items-center relative rounded-lg pb-16">
      <Button onClick={toggleVisibility} className="w-16 border-none absolute top-2 right-2">
        {isVisible ? <CircleX /> : 'Show Country Infos'}
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