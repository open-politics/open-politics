'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ClassificationSchemesTablePage from '@/components/collection/workspaces/tables/classification-schemas/page';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useSchemes } from '@/hooks/useSchemes';
import { ClassificationSchemesService } from '@/client/services';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
import { cn } from '@/lib/utils';
import { SchemeForm } from '@/components/collection/workspaces/schemes/SchemeForm';
import { SchemeFormData } from '@/lib/classification/types';
import { useTutorialStore } from '@/zustand_stores/storeTutorial';
import { Switch } from "@/components/ui/switch"
import FixedCard from '@/components/collection/wrapper/fixed-card';
import ClassificationSchemeEditor from './ClassificationSchemeEditor';
import { transformFormDataToApi } from '@/lib/classification/service';

export default function ClassificationSchemeManager() {
  const { activeWorkspace } = useWorkspaceStore();
  const {
    createScheme,
    deleteScheme,
    schemes,
    loadSchemes
  } = useSchemes();

  // State variables
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState<number | null>(null);
  const [deleteAllConfirmationOpen, setDeleteAllConfirmationOpen] = useState(false);
  const [workspaceNameConfirmation, setWorkspaceNameConfirmation] = useState('');
  const [formData, setFormData] = useState<SchemeFormData>({
    name: '',
    description: '',
    fields: [],
    model_instructions: '',
    validation_rules: {}
  });

  // Add tutorial store
  const { showSchemaBuilderTutorial, toggleSchemaBuilderTutorial } = useTutorialStore();

  // Handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace?.uid) return;

    try {
      await createScheme(
        formData,
      );

      setFormData({
        name: '',
        description: '',
        fields: [],
        model_instructions: '',
        validation_rules: {}
      });

      setIsSheetOpen(false);
      alert('Classification scheme created successfully');
    } catch (error) {
      console.error('Error creating classification scheme:', error);
    }
  };

  const handleDelete = async (schemeId: number) => {
    if (!activeWorkspace?.uid) return;
    if (confirm('Are you sure you want to delete this classification scheme?')) {
      try {
        await deleteScheme(schemeId);
        alert('Classification scheme deleted successfully');
      } catch (error) {
        console.error('Error deleting classification scheme:', error);
      }
    }
  };

  const handleDeleteAll = async () => {
    if (!activeWorkspace) {
      alert('No active workspace found.');
      return;
    }

    if (workspaceNameConfirmation !== activeWorkspace.name) {
      alert('Workspace name confirmation does not match.');
      return;
    }

    try {
      await ClassificationSchemesService.deleteAllClassificationSchemes({
        workspaceId: activeWorkspace.uid,
      });
      alert('All classification schemes deleted successfully.');
    } catch (error) {
      console.error('Error deleting all classification schemes:', error);
    } finally {
      setDeleteAllConfirmationOpen(false);
      setWorkspaceNameConfirmation('');
    }
  };

  // Effects
  useEffect(() => {
    if (activeWorkspace?.uid) {
      loadSchemes(activeWorkspace.uid);
    }
  }, [activeWorkspace?.uid, loadSchemes]);

  if (!activeWorkspace) {
    return (
      <p className="text-center text-red-400">
        Please select a workspace to manage classification schemes.
      </p>
    );
  }

  console.log(schemes);

  return (
    <div className="grid grid-cols-1 gap-4 w-full">
      <Card className="h-full p-4 px-0">
        <CardContent>
          <ClassificationSchemesTablePage 
            onCreateClick={() => setIsSheetOpen(true)}
          />
        </CardContent>
        <div className="flex justify-end p-4">  
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-50"
                onClick={() => setDeleteAllConfirmationOpen(true)}
              >
                Delete All Classification Schemes
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all classification schemes in the workspace.
                  Please type <b>{activeWorkspace?.name}</b> to confirm.
                  <Input
                    type="text"
                    value={workspaceNameConfirmation}
                    onChange={(e) => setWorkspaceNameConfirmation(e.target.value)}
                    placeholder="Workspace Name"
                    className="w-full p-3 bg-primary-800 shadow-inner mt-4"
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>

      <ClassificationSchemeEditor
        show={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        mode="create"
        defaultValues={{
          name: '',
          description: '',
          fields: [],
          model_instructions: '',
          validation_rules: {}
        }}
      />
    </div>
  );
}

