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
    <div className="relative z-50 bg-white dark:bg-black bg-opacity-20 dark:bg-opacity-20 backdrop-blur-lg rounded-lg p-2 ">
      <div className={`flex flex-col h-full ${isVisible ? 'block' : 'hidden'}`}>
        <Button onClick={toggleVisibility} className="fixed top-4 right-6 w-12 h-9 p-2">
        <CircleX size={18} />
      </Button> 
      {isVisible && (location || results) && ( 
          <IssueAreas 
            locationName={location || 'Search'}
            results={results}
            summary={summary}
          includeSummary={true}
          />
        )}
      </div>
    </div>
  );
};

export default LocationDetailPanel;