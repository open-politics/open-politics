'use client';

import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
import { DataTable } from '@/components/collection/workspaces/tables/data-table';
import { columns, Workspace } from '@/components/collection/workspaces/tables/workspaces/columns';
import EditWorkSpaceOverlay from '@/components/collection/workspaces/management/EditWorkSpaceOverlay';

interface WorkspacesPageProps {
  onEdit: (workspace: Workspace) => void;
}

export default function WorkspacesPage({ onEdit }: WorkspacesPageProps) {
  const { workspaces, fetchWorkspaces, deleteWorkspace } = useWorkspaceStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    fetchWorkspaces().catch(console.error);
  }, []);

  const handleEdit = (workspace: Workspace) => {
    onEdit(workspace);
  };

  return (
    <div className="h-full p-4">
      <div className="flex justify-center items-center">
        <h1 className="text-xl font-semibold text-center mb-8">Workspaces</h1>
      </div>
      <DataTable
        columns={columns}
        data={workspaces as Workspace[]}
        onEdit={handleEdit}
        onDelete={(workspace) => deleteWorkspace(workspace.uid)}
      />
      {selectedWorkspace && (
        <EditWorkSpaceOverlay
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          workspaceId={selectedWorkspace.uid}
          defaultName={selectedWorkspace.name}
          defaultDescription={selectedWorkspace.description}
          defaultSources={selectedWorkspace.sources}
          defaultIcon={selectedWorkspace.icon}
        />
      )}
    </div>
  );
} 