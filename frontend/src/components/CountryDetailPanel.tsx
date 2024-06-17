import React, { useState } from 'react';
import WikipediaView from './WikipediaView';
import { IssueAreas } from './IssueAreas';
import LeaderInfo from './LeaderInfo';
import { Button } from '@/components/ui/button';

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
    <div className="country-detail-panel flex flex-col max-h-5/6 items-center">
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