import React from 'react';
import { IssueAreas } from './IssueAreas';
import { Button } from '@/components/ui/button';
import { CircleX, ListCollapse } from 'lucide-react';

interface CountryDetailPanelProps {
  country: string;
  articleContent: string;
  isVisible: boolean;
  toggleVisibility: () => void;
}

const CountryDetailPanel: React.FC<CountryDetailPanelProps> = ({
  country,
  articleContent,
  isVisible,
  toggleVisibility
}) => {
  return (
    <div className="space-y-4 flex flex-col h-full p-4 items-center bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button onClick={toggleVisibility} className="w-14 h-8 p-2 border-none absolute top-2 right-2">
        {isVisible ? <CircleX size={24} /> : <ListCollapse size={24} />}
      </Button> 
      {isVisible && (
        <IssueAreas countryName={country} articleContent={articleContent} />
      )}
    </div>
  );
};

export default CountryDetailPanel;