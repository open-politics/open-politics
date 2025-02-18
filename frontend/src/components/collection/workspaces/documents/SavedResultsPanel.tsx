'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { SavedResultSetRead } from '@/client/models';
import { useDocumentStore } from '@/zustand_stores/storeDocuments';
import { useClassificationSchemeStore } from '@/zustand_stores/storeSchemas';
import { useClassificationResultStore } from '@/zustand_stores/storeClassificationResults';
import { useSavedResultSetStore } from '@/zustand_stores/storeSavedResults';
import { WorkspaceRead } from '@/client/models';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
interface SavedResultSet extends SavedResultSetRead {
}

interface SavedResultsPanelProps {
  activeWorkspace: WorkspaceRead | null;
}

export default function SavedResultsPanel() {
  const { activeWorkspace } = useWorkspaceStore();
  const { documents } = useDocumentStore();
  const { classificationSchemes } = useClassificationSchemeStore();
  const { fetchSavedResults, savedResults, saveResultSet } = useSavedResultSetStore();
  const { fetchClassificationResults } = useClassificationResultStore();
  const [isLoading, setIsLoading] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      fetchSavedResults();
    }
  }, [activeWorkspace, fetchSavedResults]);

  const handleSaveResultSet = async () => {
    if (!activeWorkspace || !saveName) return;
    
    setIsLoading(true);
    try {
      await saveResultSet({
        name: saveName,
        document_ids: documents.map(doc => doc.id),
        scheme_ids: classificationSchemes.map(scheme => scheme.id)
      });
      setShowSaveModal(false);
    } catch (error) {
      console.error('Error saving result set:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowSaveModal = () => {
    setShowSaveModal(true);
    setSaveName(''); // Clear previous name
  };

  return (
    <Card className="bg-primary-900 border-secondary-700">
      <CardHeader>
        <CardTitle className="text-secondary-500">Saved Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {savedResults.map(resultSet => (
            <Button
              key={resultSet.id}
              variant="outline"
              //onClick={() => handleLoadResultSet(resultSet.id)}
              className="text-sm"
            >
              {resultSet.name}
            </Button>
          ))}
        </div>
        <Button
          variant="default"
          onClick={handleShowSaveModal}
          className="mt-4 w-full"
        >
          Save Current Results
        </Button>

        {/* Save Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-primary-900 p-6 rounded-lg w-96">
              <h3 className="text-secondary-500 mb-4">Save Result Set</h3>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter result set name"
                className="w-full p-2 mb-4 bg-primary-800 text-secondary-300 rounded"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveResultSet}
                  disabled={isLoading || !saveName}
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 