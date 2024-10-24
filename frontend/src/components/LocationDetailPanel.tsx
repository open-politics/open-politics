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
    <div className="relative z-50 bg-white dark:bg-black bg-opacity-20 dark:bg-opacity-20 backdrop-blur-lg rounded-lg p-2">
      <div className={`flex flex-col h-full ${isVisible ? 'block' : 'hidden'}`}>
        <Button onClick={toggleVisibility} className="fixed top-4 right-6 w-12 h-9 p-2">
          <CircleX size={18} />
        </Button> 
        {isVisible && (searchTerm || results) && ( 
          <IssueAreas 
            locationName={searchTerm}
            results={results}
            summary={summary}
            includeSummary={true}
            activeTab={activeTab}
          />
        )}
      </div>
    </div>
  );
};

export default LocationDetailPanel;
