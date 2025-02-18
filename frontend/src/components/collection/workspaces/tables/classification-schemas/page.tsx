'use client';

import { useState } from 'react';
import { DataTable } from '@/components/collection/workspaces/tables/data-table';
import { columns } from './columns';
import { ClassificationSchemeRead } from "@/client/models";
import { useClassificationSchemeStore } from '@/zustand_stores/storeSchemas';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
import ClassificationSchemeEditor from '@/components/collection/workspaces/classifications/ClassificationSchemeEditor';
import { transformApiToFormData } from '@/lib/abstract-classification-schema';
import { Button } from "@/components/ui/button";
import { SchemePreview } from '@/components/collection/workspaces/schemes/SchemePreview';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { flexRender } from '@tanstack/react-table';

export default function ClassificationSchemesTablePage({ onCreateClick }: { onCreateClick: () => void }) {
  const { activeWorkspace } = useWorkspaceStore();
  const { 
    classificationSchemes,
    deleteClassificationScheme,
  } = useClassificationSchemeStore();

  const [editorState, setEditorState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'watch';
    schemeId?: number;
    defaultValues?: any;
  }>({
    isOpen: false,
    mode: 'create'
  });

  const [selectedScheme, setSelectedScheme] = useState<ClassificationSchemeRead | null>(null);

  const handleEdit = (scheme: ClassificationSchemeRead) => {
    setEditorState({
      isOpen: true,
      mode: 'edit',
      schemeId: scheme.id,
      defaultValues: transformApiToFormData(scheme)
    });
  };

  const handleView = (scheme: ClassificationSchemeRead) => {
    setSelectedScheme(scheme);
  };

  const handleDelete = async (scheme: ClassificationSchemeRead) => {
    if (!activeWorkspace?.uid) return;
    if (confirm('Are you sure you want to delete this classification scheme?')) {
      try {
        await deleteClassificationScheme(scheme.id, activeWorkspace.uid);
      } catch (error) {
        console.error('Error deleting classification scheme:', error);
      }
    }
  };

  const closeEditor = () => {
    setEditorState(prev => ({ ...prev, isOpen: false }));
  };

  const tableColumns = columns({
    onEdit: handleEdit,
    onDelete: handleDelete
  });

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={onCreateClick}>
          Create New Scheme
        </Button>
      </div>

      <div className="w-full">
        <DataTable<ClassificationSchemeRead, any>
          columns={tableColumns}
          data={classificationSchemes}
          renderRow={(row) => (
            <Popover>
              <PopoverTrigger asChild>
                <tr
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleView(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2 border-b">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[400px] p-0" 
                align="start"
                side="bottom"
                sideOffset={5}
              >
                <div className="p-4">
                  <SchemePreview 
                    scheme={transformApiToFormData(row.original)} 
                  />
                </div>
              </PopoverContent>
            </Popover>
          )}
        />
      </div>

      <ClassificationSchemeEditor
        show={editorState.isOpen}
        onClose={closeEditor}
        schemeId={editorState.schemeId}
        mode={editorState.mode}
        defaultValues={editorState.defaultValues}
      />
    </div>
  );
}