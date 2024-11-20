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
    <div className={`h-full relative z-50 bg-transparent rounded-lg p-2 pt-4 md:pt-0`}>
      <Button onClick={toggleVisibility} className="fixed right-2 w-12 h-9 p-2">
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
