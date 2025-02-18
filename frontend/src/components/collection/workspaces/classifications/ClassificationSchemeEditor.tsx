"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/zustand_stores/storeWorkspace";
import { useClassificationSchemeStore } from "@/zustand_stores/storeSchemas";
import { SchemeForm } from "@/components/collection/workspaces/schemes/SchemeForm";
import { SchemeFormData } from "@/lib/abstract-classification-schema";
import { useTutorialStore } from "@/zustand_stores/storeTutorial";
import { Switch } from "@/components/ui/switch";
import ClassificationSchemeCard from "./ClassificationSchemeCard";

interface ClassificationSchemeEditorProps {
  show: boolean;
  onClose: () => void;
  schemeId?: number;
  mode: 'create' | 'edit' | 'watch';
  defaultValues?: SchemeFormData;
}

const defaultSchemeFormData: SchemeFormData = {
  name: '',
  description: '',
  type: 'str',
  scale_min: 1,
  scale_max: 10,
  is_set_of_labels: false,
  max_labels: null,
  labels: [],
  dict_keys: [],
  model_instructions: '',
  validation_rules: {}
};

export default function ClassificationSchemeEditor({
  show,
  onClose,
  schemeId,
  mode,
  defaultValues = defaultSchemeFormData,
}: ClassificationSchemeEditorProps) {
  const { activeWorkspace } = useWorkspaceStore();
  const { createClassificationScheme, updateClassificationScheme } = useClassificationSchemeStore();
  const { showSchemaBuilderTutorial, toggleSchemaBuilderTutorial } = useTutorialStore();

  const [formData, setFormData] = useState<SchemeFormData>({
    ...defaultSchemeFormData,
    ...defaultValues
  });

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (defaultValues) {
      setFormData(prev => ({
        ...prev,
        ...defaultValues
      }));
    }
  }, [defaultValues]);

  const handleSubmit = async () => {
    if (!activeWorkspace?.uid) return;
    
    setErrorMessage("");
    try {
      if (mode === 'create') {
        await createClassificationScheme(formData, activeWorkspace.uid);
      } else if (mode === 'edit' && schemeId) {
        await updateClassificationScheme(schemeId, formData, activeWorkspace.uid);
      }
      onClose();
    } catch (error: any) {
      setErrorMessage("Error saving classification scheme");
      console.error(error);
    }
  };

  const title = {
    create: "Create New Classification Scheme",
    edit: `Edit: ${formData.name}`,
    watch: `View: ${formData.name}`
  }[mode];

  return (
    <ClassificationSchemeCard
      show={show}
      onClose={onClose}
      title={title}
      mode={mode}
      width="w-[800px]"
      height="h-[80vh]"
    >
      <div className="space-y-6">
        {mode !== 'watch' && (
          <div className="flex items-center justify-end space-x-2">
            <label className="text-sm text-muted-foreground">Show Tutorial</label>
            <Switch
              checked={showSchemaBuilderTutorial}
              onCheckedChange={toggleSchemaBuilderTutorial}
            />
          </div>
        )}

        <SchemeForm
          formData={formData}
          setFormData={setFormData}
          showTutorial={showSchemaBuilderTutorial}
          readOnly={mode === 'watch'}
          onSubmit={handleSubmit}
        />

        {errorMessage && (
          <p className="text-red-400">{errorMessage}</p>
        )}

        {mode !== 'watch' && (
          <div className="flex justify-end space-x-2 mt-6 border-t pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="scheme-form"
              className="bg-green-600 hover:bg-green-500 text-primary-950"
            >
              {mode === 'create' ? 'Create Scheme' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>
    </ClassificationSchemeCard>
  );
} 