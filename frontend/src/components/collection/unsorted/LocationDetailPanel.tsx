import React, { useState, useEffect } from 'react';
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
  const [searchTerm, setSearchTerm] = useState(location || '');

  // Update searchTerm when location changes
  useEffect(() => {
    setSearchTerm(location || '');
  }, [location]);

  return (
    <div className="h-full relative z-50 bg-transparent rounded-lg p-2 pt-4 md:pt-0">
      <Button onClick={toggleVisibility} className="fixed right-2 size-10 p-2">
        <CircleX size={24} /> 
      </Button> 
      { (searchTerm || results) && ( 
        <IssueAreas 
          locationName={searchTerm || ''} // Ensure locationName is always defined
          results={results}
          summary={summary}
          includeSummary={true}
        />
      )}
    </div>
  );
};

export default LocationDetailPanel;
