import React from 'react';
import { IssueAreas } from './IssueAreas';
import { Button } from '@/components/ui/button';
import { CircleX, ListCollapse } from 'lucide-react';

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
    <div className="flex flex-col h-full p-2 bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button onClick={toggleVisibility} className="w-14 h-8 p-2 border-none self-end mb-3">
        {isVisible ? <CircleX size={24} /> : <ListCollapse size={24} />}
      </Button> 
      {isVisible && location && ( 
        <div className="flex-grow overflow-y-auto rounded-md p-2">
          <IssueAreas 
            locationName={location}
            results={results}
            summary={summary}
          />
        </div>
      )}
    </div>
  );
};

export default LocationDetailPanel;