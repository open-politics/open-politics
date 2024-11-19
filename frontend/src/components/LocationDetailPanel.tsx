import React, { useState, useEffect } from 'react';
import { IssueAreas } from './IssueAreas';
import { Button } from '@/components/ui/button';
import { CircleX } from 'lucide-react';
import { useArticleTabNameStore } from '@/hooks/useArticleTabNameStore';

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
  const { activeTab, setActiveTab } = useArticleTabNameStore();

  // Update searchTerm when location changes
  useEffect(() => {
    setSearchTerm(location || '');
  }, [location]);

  // Set default tab when panel becomes visible with summary
  useEffect(() => {
    if (isVisible && summary && !activeTab) {
      setActiveTab('summary');
    }
  }, [isVisible, summary, activeTab, setActiveTab]);

  return (
    <div className={`h-full relative z-50 bg-background/80 backdrop-blur-lg rounded-lg p-4 pt-2`}>
      <Button onClick={toggleVisibility} className="fixed top-2 right-2 w-12 h-9 p-2">
        <CircleX size={24} />
      </Button> 
      { (searchTerm || results) && ( 
        <IssueAreas 
          locationName={searchTerm}
          results={results}
          summary={summary}
          includeSummary={true}
          activeTab={activeTab}
        />
      )}
    </div>
  );
};

export default LocationDetailPanel;
