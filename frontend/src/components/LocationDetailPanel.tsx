import React from 'react';
import { IssueAreas } from './IssueAreas';
import { Button } from '@/components/ui/button';
import { CircleX } from 'lucide-react';

interface LocationDetailPanelProps {
  location: string | null;
  isVisible: boolean;
  toggleVisibility: () => void;
  results: any; // Add appropriate type based on your data structure
  summary: string;
}

const LocationDetailPanel: React.FC<LocationDetailPanelProps> = ({
  location,
  isVisible,
  toggleVisibility,
  results,
  summary,
}) => {
  return (
    <div className={`flex flex-col h-full p-2 bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${isVisible ? 'block' : 'hidden'}`}>
      <Button onClick={toggleVisibility} className="w-14 h-8 p-2 border-none self-end">
        <CircleX size={24} />
      </Button> 
      {isVisible && (location || results) && ( 
        <div className="flex-grow overflow-y-auto rounded-md p-2">
          <IssueAreas 
            locationName={location || 'Search'}
            results={results}
            summary={summary}
            includeSummary={true}
          />
        </div>
      )}
    </div>
  );
};

export default LocationDetailPanel;